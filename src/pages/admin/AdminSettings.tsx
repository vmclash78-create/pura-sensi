import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Key, MapPin, User } from "lucide-react";

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const update = useUpdateSetting();

  const [pixKey, setPixKey] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [merchantCity, setMerchantCity] = useState("");

  useEffect(() => {
    if (settings) {
      setPixKey(settings.pix_key || "");
      setMerchantName(settings.pix_merchant_name || "");
      setMerchantCity(settings.pix_merchant_city || "");
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        update.mutateAsync({ key: "pix_key", value: pixKey.trim() }),
        update.mutateAsync({ key: "pix_merchant_name", value: merchantName.trim() }),
        update.mutateAsync({ key: "pix_merchant_city", value: merchantCity.trim() }),
      ]);
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <p>Carregando...</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações PIX</h1>
        <p className="text-sm text-muted-foreground">Configure a chave PIX e dados do recebedor</p>
      </div>

      <div className="max-w-md space-y-6 bg-card p-6 rounded-xl border border-border">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-2"><Key size={14} /> Chave PIX</Label>
          <Input
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="Ex: email, CPF, telefone ou chave aleatória"
          />
          <p className="text-xs text-muted-foreground">Esta chave será usada para gerar o QR Code e código copia e cola</p>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-2"><User size={14} /> Nome do Recebedor</Label>
          <Input
            value={merchantName}
            onChange={(e) => setMerchantName(e.target.value.toUpperCase())}
            placeholder="NOME DO RECEBEDOR"
            maxLength={25}
          />
          <p className="text-xs text-muted-foreground">Máx. 25 caracteres, sem acentos</p>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-2"><MapPin size={14} /> Cidade</Label>
          <Input
            value={merchantCity}
            onChange={(e) => setMerchantCity(e.target.value.toUpperCase())}
            placeholder="SAO PAULO"
            maxLength={15}
          />
          <p className="text-xs text-muted-foreground">Máx. 15 caracteres, sem acentos</p>
        </div>

        <Button onClick={handleSave} className="w-full" disabled={update.isPending}>
          {update.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
