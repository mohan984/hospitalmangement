import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertMessageSchema } from "@shared/schema";

const messageFormSchema = insertMessageSchema.extend({
  subject: z.string().min(1, "Please enter a subject").max(100, "Subject must be less than 100 characters"),
  content: z.string().min(10, "Please provide a detailed message (at least 10 characters)"),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

export default function SendMessage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: Omit<MessageFormData, 'userId'>) => {
      await apiRequest("POST", "/api/messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Success",
        description: "Your message has been sent successfully! Our staff will respond soon.",
      });
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="py-6 pt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Send Message</h1>
            <p className="mt-2 text-gray-600">Contact our medical staff with any questions or concerns</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Message Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the subject of your message"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your question, concern, or request in detail..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Message Guidelines</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Please provide as much detail as possible about your inquiry</li>
                      <li>• For urgent medical matters, please call our emergency line</li>
                      <li>• Our staff typically responds within 24-48 hours</li>
                      <li>• Be respectful and professional in your communication</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={sendMessageMutation.isPending}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={sendMessageMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>

                </form>
              </Form>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
