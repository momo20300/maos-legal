import { Layout } from "@/components/layout/layout";
import { ChatSidebar } from "@/components/chat/sidebar";
import { useListLegalDomains, getListLegalDomainsQueryKey, useCreateAnthropicConversation } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Scale, Loader2, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListAnthropicConversationsQueryKey } from "@workspace/api-client-react";

const formSchema = z.object({
  title: z.string().min(3, "Case title must be at least 3 characters"),
  jurisdiction: z.enum(["EU", "US", "Arabic"], { required_error: "Please select a jurisdiction" }),
  legalDomain: z.string().min(1, "Please select a legal domain"),
});

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: domains } = useListLegalDomains({
    query: { queryKey: getListLegalDomainsQueryKey() }
  });

  const createMutation = useCreateAnthropicConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListAnthropicConversationsQueryKey() });
        setLocation(`/conversations/${data.id}`);
      }
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      jurisdiction: undefined,
      legalDomain: "",
    },
  });

  const watchJurisdiction = form.watch("jurisdiction");
  
  const filteredDomains = domains?.filter(
    (d) => d.jurisdiction === watchJurisdiction
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createMutation.mutate({ data: values });
  };

  return (
    <Layout>
      <div className="flex flex-1 overflow-hidden">
        <ChatSidebar />
        
        <main className="flex-1 flex flex-col bg-background relative">
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/10">
                  <Scale className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground mb-2">New Consultation</h1>
                <p className="text-muted-foreground text-sm">Define the parameters of your legal inquiry to connect with the appropriate AI expert.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Case Reference / Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Acme Corp GDPR Compliance" className="bg-background" {...field} data-testid="input-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Jurisdiction</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background" data-testid="select-jurisdiction">
                                <SelectValue placeholder="Select applicable law" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EU">European Union (EU)</SelectItem>
                              <SelectItem value="US">United States (US)</SelectItem>
                              <SelectItem value="Arabic">Arabic Countries</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Legal Domain</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchJurisdiction}>
                            <FormControl>
                              <SelectTrigger className="bg-background" data-testid="select-domain">
                                <SelectValue placeholder={!watchJurisdiction ? "Select jurisdiction first" : "Select specialization"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredDomains?.map((domain) => (
                                <SelectItem key={domain.id} value={domain.name}>
                                  {domain.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            This determines which AI expert persona responds to your queries.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-medium shadow-md" 
                      disabled={createMutation.isPending}
                      data-testid="button-create-consultation"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Initializing Expert...
                        </>
                      ) : (
                        <>
                          Begin Consultation
                          <ChevronRight className="w-5 h-5 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}