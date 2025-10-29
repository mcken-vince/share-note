'use client';

import Link from 'next/link';
import { TopNavBar } from '@/components';
import { useAuth } from '@/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, FileText, Share2, Tags } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50">
      <TopNavBar />
      
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Welcome to Share-Note
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize your thoughts, capture ideas, and share knowledge with our simple and powerful note-taking application.
          </p>
          
          {user ? (
            <Link href="/notes">
              <Button size="lg" className="gap-2">
                Go to Your Notes
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                Create & Organize
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Create rich text notes with markdown support. Organize your thoughts with our intuitive interface.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-6 w-6 text-green-500" />
                Tag & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Add tags to categorize your notes and use powerful search to find what you need instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-6 w-6 text-purple-500" />
                Share Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Share your notes and collaborate with others. Export your content in multiple formats.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="text-center bg-white p-12 rounded-lg shadow-sm">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Join Share-Note today and start organizing your ideas.
            </p>
            <Link href="/login">
              <Button size="lg">Sign Up Now</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
