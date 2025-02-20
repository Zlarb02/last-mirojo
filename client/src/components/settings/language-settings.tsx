import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function LanguageSettings() {
  const { t, i18n } = useTranslation();

  const languages = [
    { code: "fr", name: t("settings.french") },
    { code: "en", name: t("settings.english") }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.language")}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          defaultValue={i18n.language}
          onValueChange={(value) => i18n.changeLanguage(value)}
        >
          {languages.map((lang) => (
            <div key={lang.code} className="flex items-center space-x-2">
              <RadioGroupItem value={lang.code} id={lang.code} />
              <Label htmlFor={lang.code}>{lang.name}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
