import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'E-commerce Store',
  description: 'Online shopping made easy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@100..800&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <Navbar />
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}