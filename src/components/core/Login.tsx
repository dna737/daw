import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormLabel, FormField, FormMessage, FormControl, FormItem, Form } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks";
import logo from "@/assets/daw-logo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
})

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (await login(values.name, values.email)) {
      navigate("/home");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div>
        <img 
          src={logo} 
          alt="Logo" 
          style={{ width: '150px', height: 'auto' }} 
          className="mx-auto mb-6"
        />
      </div>
      <div className="text-center text-lg font-bold mb-2">Welcome! Please login to get started 🐕</div>
      <div className="max-w-sm w-full space-y-8 p-5 border-2 border-gray-300 rounded-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                Sign in
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
