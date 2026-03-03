"use client";
import { changePassSchema } from "@/app/schemas/changepass";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
export default function ChangePassword(){
const form = useForm({
    resolver: zodResolver(changePassSchema),
    defaultValues: {
        email: "",
        newpassword: "",
        confirmpassword: "",
    },
});
    function onSubmit(){
        console.log("yoooo");
    }
    return(
        <Card>
        <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
                <CardDescription>Cambio de contraseña</CardDescription>
        </CardHeader>
            <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                    <Controller name="email" control={form.control} render={({field, fieldState}) =>(
                     <Field>
                        <FieldLabel>Email </FieldLabel>
                         <Input aria-invalid={fieldState.invalid}
                        placeholder="Jose@doe.com" type="email" {...field} />
                        {fieldState.invalid &&
                            <FieldError errors={[fieldState.error]} />
                        }    
                     </Field>  
                    )} />
                    <Controller name="newpassword" control={form.control} render={({field, fieldState}) =>(
                     <Field>
                        <FieldLabel>New pass </FieldLabel>
                        <Input aria-invalid={fieldState.invalid}
                        placeholder="*****" type="newpassword" {...field} />
                        {fieldState.invalid &&
                            <FieldError errors={[fieldState.error]} />
                        }    
                     </Field>  
                    )} />
                    <Controller name="confirmpassword" control={form.control} render={({field, fieldState}) =>(
                     <Field>
                        <FieldLabel>Confirmar password </FieldLabel>
                        <Input aria-invalid={fieldState.invalid}
                        placeholder="confirm password" type="confirmpassword" {...field} />
                        {fieldState.invalid &&
                            <FieldError errors={[fieldState.error]} />
                        }    
                     </Field>  
                    )} />
                    <Button>Sing up</Button>
                </FieldGroup>            
            </form>
            </CardContent>
        </Card>
    );
}