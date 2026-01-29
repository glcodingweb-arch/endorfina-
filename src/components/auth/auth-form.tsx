"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/* =========================================
   Schemas agrupados para coerência
========================================= */
const schemas = {
  login: z.object({
    email: z.string().email("Email inválido."),
    password: z.string().min(1, "A senha é obrigatória."),
  }),
  register: z.object({
    name: z.string().min(1, "O nome é obrigatório."),
    email: z.string().email("Email inválido."),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  }),
};

/* =========================================
   Campos renderizados dinamicamente
   Torna o formulário seco e escalável
========================================= */
const FIELDS = {
  login: [
    { name: "email" as const, label: "Email", type: "email", autoComplete: "email" },
    { name: "password" as const, label: "Senha", type: "password", autoComplete: "current-password" },
  ],

  register: [
    { name: "name" as const, label: "Nome", type: "text", autoComplete: "name" },
    { name: "email" as const, label: "Email", type: "email", autoComplete: "email" },
    { name: "password" as const, label: "Senha", type: "password", autoComplete: "new-password" },
  ],
};

const getInitialValues = (mode: 'login' | 'register') => {
    return Object.fromEntries(Object.keys(schemas[mode].shape).map(key => [key, '']));
};


/* =========================================
   Firebase abstraído → arquitetura mais madura
========================================= */
async function firebaseLogin(auth: any, values: z.infer<typeof schemas.login>) {
  return signInWithEmailAndPassword(auth, values.email, values.password);
}

async function firebaseRegister(auth: any, values: z.infer<typeof schemas.register>) {
  return createUserWithEmailAndPassword(auth, values.email, values.password);
}

/* =========================================
   Formulário principal
========================================= */
export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const isRegister = params.get("form") === "register";
  const mode = isRegister ? "register" : "login";

  const schema = schemas[mode];
  type SchemaType = z.infer<typeof schema>;

  const form = useForm<SchemaType>({
    resolver: zodResolver(schema),
    defaultValues: getInitialValues(mode),
  });

  useEffect(() => {
    form.reset(getInitialValues(mode));
  }, [mode, form]);

  /* =========================================
     Submit Handlers → isolados, limpos e previsíveis
  ========================================= */
  async function onSubmit(values: SchemaType) {
    if (!auth) return;

    setIsLoading(true);
    try {
      if (isRegister) {
        await firebaseRegister(auth, values as z.infer<typeof schemas.register>);
        toast({
          title: "Cadastro realizado!",
          description: "Você já pode fazer login.",
        });
        router.push("/login");
      } else {
        const { user } = await firebaseLogin(auth, values as z.infer<typeof schemas.login>);
        toast({
          title: "Login realizado!",
          description: "Bem-vindo(a) de volta.",
        });

        router.push(user.email === "adm@gmail.com" ? "/admin" : "/dashboard");
      }

      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Algo deu errado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  /* =========================================
     Renderização
  ========================================= */
  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
          autoComplete="off"
        >
          {FIELDS[mode].map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem className="grid gap-2">
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      type={field.type}
                      disabled={isLoading}
                      autoComplete={field.autoComplete}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? isRegister
                ? "Criando conta..."
                : "Entrando..."
              : isRegister
              ? "Criar conta"
              : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
