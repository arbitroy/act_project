import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DailyReportRecord } from './types';

interface DailyReportTableProps {
    records: DailyReportRecord[];
    onEdit: (record: DailyReportRecord) => void;
    onDelete: (id: number) => void;
}

export const DailyReportTable: React.FC<DailyReportTableProps> = ({
    records,
    onEdit,
    onDelete,
}) => {
    if (records.length === 0) {
        return (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No records added yet. Click &quot;Add New Record&quot; to begin.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden mt-6">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job Number</TableHead>
                        <TableHead>Table Number</TableHead>
                        <TableHead>Element</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Volume (m³)</TableHead>
                        <TableHead>MEP</TableHead>
                        <TableHead>RFT Source</TableHead>
                        <TableHead>Remarks</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.map((record) => (
                        <TableRow key={record.id}>
                            <TableCell>{record.job_number}</TableCell>
                            <TableCell>{record.table_number}</TableCell>
                            <TableCell>{record.element_id}</TableCell>
                            <TableCell>{record.planned_amount}</TableCell>
                            <TableCell>{record.planned_volume}</TableCell>
                            <TableCell>{record.mep}</TableCell>
                            <TableCell>{record.rft}</TableCell>
                            <TableCell className="max-w-xs truncate">
                                {record.remarks}
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(record)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(record.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};