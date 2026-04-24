import { Layout } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">{t.notFound.title}</h1>
            <p className="mt-3 text-muted-foreground">{t.notFound.description}</p>
          </div>
          <Link href="/">
            <Button className="mt-2">{t.notFound.goHome}</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
