'use client';


import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-[#0f172a] via-[#1e1a78] to-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Todo App</h1>
          <nav className="flex space-x-4">
            <Link href="/login" className=" bg-blue-500 px-6 py-3 text-base font-medium rounded-md hover:text-gray-900">
              Login
            </Link>
            <Link href="/signup" className="text-base bg-blue-500 px-6 py-3 font-medium rounded-md  hover:text-gray-900">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Manage Your Tasks Effortlessly
          </h1>
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
            A beautiful and intuitive todo application to help you stay organized and productive.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link href="/signup">
              <Button className="px-6 py-3 text-base font-medium rounded-md">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="px-6 py-3 text-base font-medium rounded-md">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Todo App. All rights reserved.</p>
      </footer>
    </div>
  );
}