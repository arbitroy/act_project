import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ClipboardList, BarChart, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="text-2xl font-bold">ACT Precast</div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#features" className="hover:text-green-200 transition-colors">Features</a></li>
              <li><a href="#about" className="hover:text-green-200 transition-colors">About</a></li>
              <li><a href="#contact" className="hover:text-green-200 transition-colors">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-5xl font-bold text-green-800 mb-4">Streamline Your Casting Projects</h1>
            <p className="text-xl text-green-600 mb-8">Efficient planning, tracking, and reporting for your casting operations</p>
            <div className="space-x-4">
              <Link href="/signup">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-100 px-8 py-3 rounded-lg text-lg">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-green-800 mb-12 text-center">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-green-200">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <ClipboardList className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Daily Reporting</h3>
                  <p className="text-green-600">Easily log and track daily casting activities and progress</p>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <BarChart className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Analytics</h3>
                  <p className="text-green-600">Gain insights with comprehensive project analytics and reporting</p>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Users className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Team Management</h3>
                  <p className="text-green-600">Efficiently manage your team and assign roles and responsibilities</p>
                </CardContent>
              </Card>
              <Card className="border-green-200">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Zap className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Real-time Updates</h3>
                  <p className="text-green-600">Stay updated with real-time project status and notifications</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-green-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">About ACT Precast</h2>
            <p className="text-lg text-green-700 max-w-3xl mx-auto text-center">
              ACT Precast is a comprehensive project management solution designed specifically for the casting industry. 
              Our platform streamlines the entire casting process, from planning to execution, helping you increase 
              efficiency and reduce errors. With ACT Precast, you can focus on what matters most - delivering high-quality 
              castings on time and within budget.
            </p>
          </div>
        </section>

        <section id="contact" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Get In Touch</h2>
            <div className="max-w-md mx-auto">
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-green-700">Name</label>
                      <input type="text" id="name" name="name" className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-green-700">Email</label>
                      <input type="email" id="email" name="email" className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500" />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-green-700">Message</label>
                      <textarea id="message" name="message" rows={4} className="mt-1 block w-full rounded-md border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500"></textarea>
                    </div>
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 ACT Precast. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}