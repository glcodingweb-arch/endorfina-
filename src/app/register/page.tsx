'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Loader2, Eye, EyeOff, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);


  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Erro de autenticação",
            description: "Não foi possível conectar aos serviços de autenticação.",
        });
        return;
    }

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const fullName = formData.get("fullName") as string;
    
    const profileData = {
        fullName,
        email,
        documentType: 'CPF',
        documentNumber: formData.get("documentNumber") as string,
        gender: formData.get("gender") as string,
        mobilePhone: formData.get("mobilePhone") as string,
        zipCode: formData.get("zipCode") as string,
        address: formData.get("address") as string,
        addressNumber: formData.get("addressNumber") as string,
        complement: formData.get("complement") as string,
        neighborhood: formData.get("neighborhood") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        country: formData.get("country") as string,
    };

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "As senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Atualiza o display name no Auth
      await updateProfile(user, { displayName: fullName });
      
      // Salva os dados do perfil no Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        ...profileData,
        createdAt: serverTimestamp(),
      });
      
      // Envia o e-mail de boas-vindas
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            type: 'welcome',
            data: {
              customerName: fullName,
            },
          }),
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Não bloqueia o fluxo do usuário se o e-mail falhar
      }

      toast({
        title: "Conta criada com sucesso!",
        description: "Você será redirecionado para a página inicial.",
      });
      router.push("/");
    } catch (error: any) {
       let description = "Ocorreu um erro ao criar sua conta. Tente novamente.";
       if (error.code === 'auth/email-already-in-use') {
           description = "Este endereço de e-mail já está em uso por outra conta.";
       } else if (error.code === 'auth/weak-password') {
           description = "A senha é muito fraca. Tente uma senha com pelo menos 6 caracteres.";
       }
      toast({
        variant: "destructive",
        title: "Erro no Cadastro",
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-indigo-900/20"></div>
      
      <div className="max-w-3xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
           <div 
             className="inline-flex items-center gap-2 mb-6 cursor-pointer"
             onClick={() => router.push('/')}
           >
              <Logo className="text-white" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter">CRIE SUA CONTA DE ATLETA</h1>
           <p className="text-slate-400 text-sm mt-2">Junte-se à nossa comunidade e acelere para a próxima linha de chegada.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSignUp}>
          {/* Dados Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome Completo</Label>
                <Input name="fullName" required type="text" placeholder="Seu nome" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail</Label>
                <Input name="email" required type="email" placeholder="seu-melhor-email@exemplo.com" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
            </div>
            <div className="space-y-2 relative">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha</Label>
                <Input name="password" required type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full px-6 py-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 bottom-1.5 h-8 w-8 text-white/50 hover:text-white" onClick={() => setShowPassword(prev => !prev)}>
                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </Button>
            </div>
            <div className="space-y-2 relative">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Repita a Senha</Label>
                <Input name="confirmPassword" required type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="w-full px-6 py-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 bottom-1.5 h-8 w-8 text-white/50 hover:text-white" onClick={() => setShowConfirmPassword(prev => !prev)}>
                    {showConfirmPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </Button>
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">CPF</Label>
                <Input name="documentNumber" required placeholder="000.000.000-00" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
            </div>
            <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Gênero</Label>
                <Select name="gender" required>
                    <SelectTrigger className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold h-auto">
                    <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Celular</Label>
                <Input name="mobilePhone" required placeholder="(00) 00000-0000" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
            </div>
          </div>
          
          <Collapsible open={isAddressOpen} onOpenChange={setIsAddressOpen}>
            <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-white transition-colors w-full">
                    <Separator className="flex-1 bg-white/10" />
                    <span className="text-xs font-bold whitespace-nowrap">Endereço (Opcional)</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isAddressOpen ? 'rotate-180' : ''}`} />
                    <Separator className="flex-1 bg-white/10" />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">CEP</Label>
                        <Input name="zipCode" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Bairro</Label>
                        <Input name="neighborhood" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Endereço</Label>
                        <Input name="address" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Número</Label>
                        <Input name="addressNumber" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Complemento</Label>
                        <Input name="complement" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Cidade</Label>
                        <Input name="city" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Estado</Label>
                        <Input name="state" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                     <div className="space-y-2 md:col-span-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">País</Label>
                        <Input name="country" defaultValue="Brasil" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
                    </div>
                  </div>
            </CollapsibleContent>
          </Collapsible>
          
           {/* Botão de Ação e Link de Login */}
           <div className="space-y-6 pt-6">
                <Button type="submit" className="w-full py-5 h-auto bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20 active:scale-95 uppercase tracking-widest text-xs" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                    {isLoading ? 'Finalizando cadastro...' : 'Criar Conta e Acessar Painel'}
                </Button>

                <p className="text-center text-slate-500 text-sm font-bold">
                    Já tem uma conta? <Link href="/login" className="text-purple-400 cursor-pointer hover:underline">Faça login</Link>
                </p>
           </div>
        </form>
      </div>
    </div>
  );
}
