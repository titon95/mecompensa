import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "MeCompensa.es — ¿Te compensan las placas solares?",
  description:
    "Calcula gratis si instalar placas solares merece la pena en tu caso: cuántas necesitas, cuánto cuesta y en cuántos años recuperas la inversión.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
