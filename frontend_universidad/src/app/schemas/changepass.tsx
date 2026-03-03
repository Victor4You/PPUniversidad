import z from "zod";
export const  changePassSchema =  z.object({
    email:  z.email(),
    newpassword: z.string().min(7).max(30),
    confirmpassword: z.string().min(7).max(30),

});