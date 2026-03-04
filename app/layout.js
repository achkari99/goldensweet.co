export const metadata = {
  title: 'Cinnamona Refactor Runtime',
  description: 'Internal runtime route for Next.js refactor copy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}