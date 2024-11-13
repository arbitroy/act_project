import { NextResponse, NextRequest } from 'next/server'
import { authMiddleware } from '@/middleware/auth'
import { queryWithRetry } from '../db'

export async function GET(request: NextRequest) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) {
        return authResponse;
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const job = searchParams.get('job') || '';
    const table = searchParams.get('table') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = (page - 1) * limit;

    try {
        let countQuery = 'SELECT COUNT(*) FROM dailyreports dr JOIN jobs j ON dr.job_id = j.id JOIN tables t ON dr.table_id = t.id JOIN elements e ON dr.element_id = e.id';
        let dataQuery = `
        WITH latest_planned_casting AS (
            SELECT DISTINCT ON (element_id, planned_date) 
                element_id,
                planned_date,
                planned_volume,
                planned_amount
            FROM planned_castings
            ORDER BY element_id, planned_date, id DESC
        )
        SELECT 
            dr.*, 
            j.job_number, 
            t.table_number, 
            e.element_id as element_code,
            e.volume as element_volume,
            e.required_amount,
            pc.planned_volume,
            pc.planned_amount,
            COALESCE(
                (SELECT SUM(ac.casted_amount) 
                FROM actualcastings ac
                JOIN dailyreports dr2 ON ac.daily_report_id = dr2.id
                WHERE dr2.element_id = dr.element_id 
                AND dr2.date < CURRENT_DATE), 
            0) as already_casted,
            COALESCE(
                (SELECT SUM(ac.casted_volume) 
                FROM actualcastings ac
                JOIN dailyreports dr2 ON ac.daily_report_id = dr2.id
                WHERE dr2.element_id = dr.element_id 
                AND dr2.date < CURRENT_DATE), 
            0) as already_casted_volume,
            GREATEST(0, e.required_amount - COALESCE(
                (SELECT SUM(ac.casted_amount) 
                FROM actualcastings ac
                JOIN dailyreports dr2 ON ac.daily_report_id = dr2.id
                WHERE dr2.element_id = dr.element_id 
                AND dr2.date <= CURRENT_DATE),
            0)) as remaining_qty,
            COALESCE(
                (SELECT SUM(ac.casted_amount) 
                FROM actualcastings ac
                WHERE ac.daily_report_id = dr.id), 
            0) as actual_casted,
            COALESCE(
                (SELECT SUM(ac.casted_volume) 
                FROM actualcastings ac
                WHERE ac.daily_report_id = dr.id), 
            0) as actual_volume
        FROM dailyreports dr
        JOIN jobs j ON dr.job_id = j.id
        JOIN tables t ON dr.table_id = t.id
        JOIN elements e ON dr.element_id = e.id
        LEFT JOIN latest_planned_casting pc ON dr.element_id = pc.element_id AND dr.date = pc.planned_date
        `;

        const queryParams: (string | number)[] = [];
        const whereClause = [];

        let paramCount = 1;

        if (date) {
            whereClause.push(`dr.date = $${paramCount}`);
            queryParams.push(date);
            paramCount++;

            // Update date-dependent calculations in the query
            dataQuery = dataQuery.replace(/CURRENT_DATE/g, '$1');
        }
        
        if (search) {
            whereClause.push(`(j.job_number ILIKE $${paramCount} OR t.table_number ILIKE $${paramCount} OR e.element_id ILIKE $${paramCount})`);
            queryParams.push(`%${search}%`);
            paramCount++;
        }
        
        if (job) {
            whereClause.push(`j.job_number = $${paramCount}`);
            queryParams.push(job);
            paramCount++;
        }
        
        if (table) {
            whereClause.push(`t.table_number = $${paramCount}`);
            queryParams.push(table);
            paramCount++;
        }

        if (whereClause.length > 0) {
            const whereString = whereClause.join(' AND ');
            countQuery += ' WHERE ' + whereString;
            dataQuery += ' WHERE ' + whereString;
        }

        dataQuery += ' ORDER BY dr.id ASC';

        // Create separate parameter arrays for count and data queries
        const countParams = [...queryParams];
        
        if (limit !== -1) {
            dataQuery += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
            queryParams.push(limit, offset);
        }

        const countResult = await queryWithRetry(countQuery, countParams);
        const totalReports = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalReports / limit);

        const result = await queryWithRetry(dataQuery, queryParams);

        return NextResponse.json({
            reports: result.rows,
            totalPages: limit === -1 ? 1 : totalPages,
            currentPage: limit === -1 ? 1 : page
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { date, user_id, job_id, table_id, element_id, mep, remarks, rft } = await request.json()

    try {
        const result = await queryWithRetry(
            'INSERT INTO dailyreports (date, user_id, job_id, table_id, element_id, mep, remarks, rft) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [date, user_id, job_id, table_id, element_id, mep, remarks, rft]
        )

        return NextResponse.json(result.rows[0], { status: 201 })
    } catch (error) {
        console.error('Error creating daily report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}


export async function PUT(request: NextRequest) {
    const authResponse = await authMiddleware(request);
    if (authResponse.status === 401) {
        return authResponse;
    }

    const { id, status, rft } = await request.json();

    try {
        // Only update the status if rft is not provided
        const query = rft !== undefined 
            ? 'UPDATE dailyreports SET status = $1, rft = $2 WHERE id = $3 RETURNING *'
            : 'UPDATE dailyreports SET status = $1 WHERE id = $2 RETURNING *';
        
        const params = rft !== undefined 
            ? [status, rft, id]
            : [status, id];

        const result = await queryWithRetry(query, params);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Daily report not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating daily report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const authResponse = await authMiddleware(request)
    if (authResponse.status === 401) {
        return authResponse
    }

    const { id } = await request.json()

    try {
        const result = await queryWithRetry('DELETE FROM dailyreports WHERE id = $1 RETURNING *', [id])

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Daily report not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Daily report deleted successfully' })
    } catch (error) {
        console.error('Error deleting daily report:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}