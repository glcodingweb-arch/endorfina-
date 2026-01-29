"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth) return;

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha o e-mail e a senha.",
      });
      return;
    }

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo(a) de volta.",
      });
      
      if (user.email === "adm@gmail.com") {
          router.push("/admin");
      } else if (user.email === "entregador@gmail.com") {
          router.push("/delivery");
      } else if (user.email === "staff@gmail.com") {
          router.push("/staff");
      } else {
          router.push("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro de login",
        description: "Credenciais inválidas. Verifique seu e-mail e senha.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-indigo-900/20"></div>
      
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
           <div 
             className="inline-flex items-center gap-2 mb-6 cursor-pointer"
             onClick={() => router.push('/')}
           >
              <Logo className="text-white" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tighter">BEM-VINDO AO HUB</h1>
           <p className="text-slate-400 text-sm mt-2">Acesse seus resultados e inscrições.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignIn}>
           <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">E-mail do Atleta</Label>
              <Input name="email" required type="email" placeholder="atleta@endorfina.com" className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
           </div>
           <div className="space-y-2 relative">
              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Senha</Label>
              <Input name="password" required type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full px-6 py-4 pr-12 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-purple-600 focus:outline-none transition-all font-bold" />
               <Button type="button" variant="ghost" size="icon" className="absolute right-2 bottom-1.5 h-8 w-8 text-white/50 hover:text-white" onClick={() => setShowPassword(prev => !prev)}>
                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
              </Button>
           </div>
           <Button type="submit" className="w-full py-5 h-auto bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-900/20 active:scale-95 uppercase tracking-widest text-xs">
             Entrar na Conta
           </Button>
        </form>

        <p className="mt-10 text-center text-slate-500 text-sm font-bold">
          Novo no asfalto? <span onClick={() => router.push('/register')} className="text-purple-400 cursor-pointer hover:underline">Crie sua conta</span>
        </p>
      </div>
    </div>
  );
}
