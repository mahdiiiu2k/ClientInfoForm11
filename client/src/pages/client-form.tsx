import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Building, Tag, TriangleAlert, CircleOff, ServerCog, FolderOpen, Shield, MapPin, NotebookPen, UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertClientSubmissionSchema, type InsertClientSubmission } from "@shared/schema";
import { z } from "zod";

// Extend schema for form validation
const formSchema = insertClientSubmissionSchema.extend({
  services: z.array(z.object({
    name: z.string().min(1, "Service name is required"),
    description: z.string().min(1, "Service description is required"),
    steps: z.string().optional(),
    picture: z.any().optional(),
  })).optional().default([]),
  projects: z.array(z.object({
    title: z.string().min(1, "Project title is required"),
    description: z.string().min(1, "Project description is required"),
    beforeAfter: z.boolean().default(false),
    beforePictures: z.any().optional(),
    afterPictures: z.any().optional(),
    pictures: z.any().optional(),
    clientFeedback: z.string().optional(),
  })).optional().default([]),
  serviceAreas: z.array(z.object({
    type: z.enum(['neighborhoods', 'cities', 'counties', 'radius']),
    name: z.string().min(1, "Area name is required"),
    description: z.string().optional(),
  })).optional().default([]),
});

type FormData = z.infer<typeof formSchema>;

interface Service {
  name: string;
  description: string;
  steps?: string;
  picture?: FileList;
}

interface Project {
  title: string;
  description: string;
  beforeAfter: boolean;
  beforePictures?: FileList;
  afterPictures?: FileList;
  pictures?: FileList;
  clientFeedback?: string;
}

interface ServiceArea {
  type: 'neighborhoods' | 'cities' | 'counties' | 'radius';
  name: string;
  description?: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

const slideDown = {
  initial: { opacity: 0, maxHeight: 0, y: -10 },
  animate: { opacity: 1, maxHeight: 1000, y: 0 },
  exit: { opacity: 0, maxHeight: 0, y: -10 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export default function ClientForm() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [isTypingExperience, setIsTypingExperience] = useState(false);
  const experienceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showWarrantySection, setShowWarrantySection] = useState(false);
  const [showInsuranceSection, setShowInsuranceSection] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState<Service>({ name: "", description: "", steps: "" });
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState<Project>({ 
    title: "", 
    description: "", 
    beforeAfter: false,
    clientFeedback: ""
  });
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [newAreaName, setNewAreaName] = useState("");
  const [areaDescription, setAreaDescription] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearsOfExperience: undefined,
      businessEmail: "",
      hasLicense: undefined,
      licenseNumber: "",
      businessAddress: "",
      businessHours: "",
      hasEmergencyServices: undefined,
      hasEmergencyPhone: undefined,
      emergencyPhone: "",
      enableAboutModifications: false,
      companyStory: "",
      uniqueSellingPoints: "",
      specialties: "",
      services: [],
      projects: [],
      hasWarranty: false,
      warrantyDescription: "",
      hasInsurance: false,
      generalLiability: "",
      workersCompensation: false,
      bondedAmount: "",
      additionalCoverage: "",
      serviceAreas: [],
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertClientSubmission) => {
      return apiRequest("POST", "/api/client-submissions", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your client information has been submitted successfully.",
      });
      form.reset();
      setServices([]);
      setProjects([]);
      setServiceAreas([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Process file uploads and convert to the expected format
    const processedData: InsertClientSubmission = {
      ...data,
      services: services.map(service => ({
        name: service.name,
        description: service.description,
        steps: service.steps,
        pictureUrl: service.picture?.[0]?.name // In a real app, you'd upload to a CDN
      })),
      projects: projects.map(project => ({
        title: project.title,
        description: project.description,
        beforeAfter: project.beforeAfter,
        beforePictureUrls: project.beforePictures ? Array.from(project.beforePictures).map(f => f.name) : undefined,
        afterPictureUrls: project.afterPictures ? Array.from(project.afterPictures).map(f => f.name) : undefined,
        pictureUrls: project.pictures ? Array.from(project.pictures).map(f => f.name) : undefined,
        clientFeedback: project.clientFeedback,
      })),
      serviceAreas,
    };

    submitMutation.mutate(processedData);
  };

  const addService = () => {
    setServices([...services, { name: "", description: "", steps: "" }]);
  };

  const addServiceFromModal = () => {
    if (newService.name && newService.description) {
      if (editingServiceIndex !== null) {
        // Update existing service
        const updatedServices = [...services];
        updatedServices[editingServiceIndex] = { ...newService };
        setServices(updatedServices);
        setEditingServiceIndex(null);
      } else {
        // Add new service
        setServices([...services, { ...newService }]);
      }
      setNewService({ name: "", description: "", steps: "" });
      setShowServiceModal(false);
    }
  };

  const editService = (index: number) => {
    setNewService({ ...services[index] });
    setEditingServiceIndex(index);
    setShowServiceModal(true);
  };

  const addProjectFromModal = () => {
    if (newProject.title && newProject.description) {
      if (editingProjectIndex !== null) {
        // Update existing project
        const updatedProjects = [...projects];
        updatedProjects[editingProjectIndex] = { ...newProject };
        setProjects(updatedProjects);
        setEditingProjectIndex(null);
      } else {
        // Add new project
        setProjects([...projects, { ...newProject }]);
      }
      setNewProject({ 
        title: "", 
        description: "", 
        beforeAfter: false,
        clientFeedback: ""
      });
      setShowProjectModal(false);
    }
  };

  const editProject = (index: number) => {
    setNewProject({ ...projects[index] });
    setEditingProjectIndex(index);
    setShowProjectModal(true);
  };

  const addAreaFromInput = () => {
    if (newAreaName.trim()) {
      const newArea: ServiceArea = {
        type: 'neighborhoods',
        name: newAreaName.trim(),
        description: areaDescription.trim() || undefined
      };
      setServiceAreas([...serviceAreas, newArea]);
      setNewAreaName("");
    }
  };

  const removeArea = (index: number) => {
    const updatedAreas = serviceAreas.filter((_, i) => i !== index);
    setServiceAreas(updatedAreas);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addProject = () => {
    setProjects([...projects, { title: "", description: "", beforeAfter: false }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addServiceArea = () => {
    setServiceAreas([...serviceAreas, { type: "cities", name: "", description: "" }]);
  };

  const removeServiceArea = (index: number) => {
    setServiceAreas(serviceAreas.filter((_, i) => i !== index));
  };

  const updateServiceArea = (index: number, field: keyof ServiceArea, value: any) => {
    const updated = [...serviceAreas];
    updated[index] = { ...updated[index], [field]: value };
    setServiceAreas(updated);
  };

  const hasLicense = form.watch("hasLicense");
  const hasEmergencyServices = form.watch("hasEmergencyServices");
  const hasEmergencyPhone = form.watch("hasEmergencyPhone");

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Client Information Collection
          </h1>
          <p className="text-slate-600 text-lg">
            Please provide your business details to complete your profile
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <UserCircle className="text-primary mr-3 h-5 w-5" />
                  Basic Information
                </h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            placeholder="Enter years of experience"
                            className={isTypingExperience ? "input-typing" : ""}
                            data-testid="input-years-experience"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : parseInt(value) || 0);
                              
                              // Start blinking effect
                              setIsTypingExperience(true);
                              
                              // Clear existing timeout
                              if (experienceTimeoutRef.current) {
                                clearTimeout(experienceTimeoutRef.current);
                              }
                              
                              // Stop blinking after 2 seconds of no typing
                              experienceTimeoutRef.current = setTimeout(() => {
                                setIsTypingExperience(false);
                              }, 2000);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Use personal email if no business email available" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* License Information Section */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <Tag className="text-primary mr-3 h-5 w-5" />
                  License Information
                </h2>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have a license number? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value === undefined ? undefined : field.value ? "yes" : "no"}
                          onValueChange={(value) => field.onChange(value === "yes")}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="license-yes" />
                            <Label htmlFor="license-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="license-no" />
                            <Label htmlFor="license-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {hasLicense && (
                    <motion.div {...fadeInUp}>
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter license number" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Address and Business Hours */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <Building className="text-primary mr-3 h-5 w-5" />
                  Business Details
                </h2>
              </div>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="businessAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Office/Business Address <span className="text-slate-500">(Optional if not available)</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="123 Business St, City, State 12345" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Business Hours <span className="text-slate-500">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="e.g., Monday-Friday 8AM-6PM, Saturday 9AM-4PM"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Emergency Services Section */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <TriangleAlert className="text-primary mr-3 h-5 w-5" />
                  Emergency Services
                </h2>
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasEmergencyServices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you offer emergency services? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={field.value === undefined ? undefined : field.value ? "yes" : "no"}
                          onValueChange={(value) => field.onChange(value === "yes")}
                          className="flex space-x-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="emergency-yes" />
                            <Label htmlFor="emergency-yes">Yes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="emergency-no" />
                            <Label htmlFor="emergency-no">No</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {hasEmergencyServices && (
                    <motion.div {...fadeInUp} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="hasEmergencyPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Do you have a specific phone number for emergencies?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                value={field.value === undefined ? undefined : field.value ? "yes" : "no"}
                                onValueChange={(value) => field.onChange(value === "yes")}
                                className="flex space-x-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="yes" id="emergency-phone-yes" />
                                  <Label htmlFor="emergency-phone-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id="emergency-phone-no" />
                                  <Label htmlFor="emergency-phone-no">No</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <AnimatePresence>
                        {hasEmergencyPhone && (
                          <motion.div {...fadeInUp}>
                            <FormField
                              control={form.control}
                              name="emergencyPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Emergency Phone Number *</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="(555) 123-4567" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* About Section Modifications */}
            <div className="space-y-6">
              <div 
                className={`transition-colors p-4 rounded-lg border border-slate-200 ${
                  showAboutSection 
                    ? 'bg-slate-50' 
                    : 'cursor-pointer hover:bg-slate-100 bg-slate-50'
                }`}
              >
                <div
                  className={showAboutSection ? '' : 'cursor-pointer'}
                  onClick={() => setShowAboutSection(!showAboutSection)}
                  data-testid="button-toggle-about-section"
                >
                  <h2 className="flex items-center text-xl text-slate-800 font-semibold">
                    <CircleOff className="text-primary mr-3 h-5 w-5" />
                    About Us Section Customization (optional)
                    {showAboutSection ? (
                      <ChevronUp className="h-5 w-5 text-slate-600 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-600 ml-2" />
                    )}
                  </h2>
                </div>
              
                <AnimatePresence>
                  {showAboutSection && (
                    <motion.div {...slideDown} className="mt-6">
                      <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="companyStory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Story/Background</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="Tell us about your company's history and background..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="uniqueSellingPoints"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>What Sets You Apart (Unique Selling Points)</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={4}
                                placeholder="What makes your business unique and different from competitors..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="specialties"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specific Specialties to Highlight</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="List your main areas of expertise and specialization..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Services Customization Section */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <ServerCog className="text-primary mr-3 h-5 w-5" />
                  Services Customization
                </h2>
                
                {/* Services Slider Layout */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                  {/* Rectangle Add Service Button */}
                  <Dialog open={showServiceModal} onOpenChange={setShowServiceModal}>
                    <DialogTrigger asChild>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[280px] flex-shrink-0">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-slate-600 font-medium mb-2">Add Service</span>
                          <Plus className="h-6 w-6 text-slate-400" />
                        </div>
                      </div>
                    </DialogTrigger>
                    
                    {/* Service Modal */}
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingServiceIndex !== null 
                            ? `Service #${editingServiceIndex + 1}` 
                            : `Service #${services.length + 1}`
                          }
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="serviceName">Service Name *</Label>
                          <Input
                            id="serviceName"
                            placeholder="e.g., Plumbing Repair"
                            value={newService.name}
                            onChange={(e) => setNewService({...newService, name: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceDescription">Service Description *</Label>
                          <Textarea
                            id="serviceDescription"
                            rows={3}
                            placeholder="Describe this service..."
                            value={newService.description}
                            onChange={(e) => setNewService({...newService, description: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="serviceSteps">Executing Steps (Optional)</Label>
                          <Textarea
                            id="serviceSteps"
                            rows={3}
                            placeholder="Describe the process or steps..."
                            value={newService.steps || ""}
                            onChange={(e) => setNewService({...newService, steps: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="servicePicture">Add Picture</Label>
                          <Input
                            id="servicePicture"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewService({...newService, picture: e.target.files || undefined})}
                          />
                          <span className="text-sm text-slate-500 mt-1">Aucun fichier choisi</span>
                        </div>
                        
                        <Button 
                          onClick={addServiceFromModal}
                          className="w-full bg-primary hover:bg-blue-700"
                          disabled={!newService.name || !newService.description}
                        >
                          {editingServiceIndex !== null ? 'Save' : 'Add Service'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Display Added Services */}
                  {services.map((service, index) => (
                    <motion.div
                      key={index}
                      {...fadeInUp}
                      className="border border-slate-200 rounded-lg p-4 bg-white min-w-[280px] flex-shrink-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-slate-800">
                            Service #{index + 1}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {service.name || "Untitled Service"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeService(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editService(index)}
                            className="text-primary border-primary hover:bg-primary hover:text-white"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Previous Projects Section */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <FolderOpen className="text-primary mr-3 h-5 w-5" />
                  Previous Projects
                </h2>
                
                {/* Projects Slider Layout */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                  {/* Rectangle Add Project Button */}
                  <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
                    <DialogTrigger asChild>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[280px] flex-shrink-0">
                        <div className="flex flex-col items-center text-center">
                          <span className="text-slate-600 font-medium mb-2">Add Project</span>
                          <Plus className="h-6 w-6 text-slate-400" />
                        </div>
                      </div>
                    </DialogTrigger>
                  
                    {/* Project Modal */}
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingProjectIndex !== null 
                            ? `Project #${editingProjectIndex + 1}` 
                            : `Project #${projects.length + 1}`
                          }
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="projectTitle">Project Title *</Label>
                          <Input
                            id="projectTitle"
                            placeholder="e.g., Kitchen Renovation"
                            value={newProject.title}
                            onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="projectDescription">Project Description *</Label>
                          <Textarea
                            id="projectDescription"
                            rows={3}
                            placeholder="Describe the project..."
                            value={newProject.description}
                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="beforeAfter"
                              checked={newProject.beforeAfter}
                              onCheckedChange={(checked) => setNewProject({...newProject, beforeAfter: checked as boolean})}
                            />
                            <Label htmlFor="beforeAfter">Before/After Photos</Label>
                          </div>
                        </div>
                        
                        <div>
                          {newProject.beforeAfter ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="beforePictures">Before Pictures</Label>
                                <Input
                                  id="beforePictures"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => setNewProject({...newProject, beforePictures: e.target.files || undefined})}
                                />
                              </div>
                              <div>
                                <Label htmlFor="afterPictures">After Pictures</Label>
                                <Input
                                  id="afterPictures"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => setNewProject({...newProject, afterPictures: e.target.files || undefined})}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Label htmlFor="projectPictures">Project Pictures</Label>
                              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 max-w-full">
                                {/* Add Pictures Button */}
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[200px] flex-shrink-0">
                                  <input
                                    id="projectPictures"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files.length > 0) {
                                        const newFiles = Array.from(e.target.files);
                                        const existingFiles = newProject.pictures ? Array.from(newProject.pictures) : [];
                                        const allFiles = [...existingFiles, ...newFiles];
                                        
                                        // Create new FileList
                                        const dataTransfer = new DataTransfer();
                                        allFiles.forEach(file => dataTransfer.items.add(file));
                                        
                                        setNewProject({...newProject, pictures: dataTransfer.files});
                                        console.log('Total files:', dataTransfer.files.length);
                                        
                                        // Reset the input so the same files can be selected again if needed
                                        e.target.value = '';
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor="projectPictures" 
                                    className="flex flex-col items-center text-center cursor-pointer"
                                  >
                                    <span className="text-slate-600 font-medium mb-2">Add Pictures</span>
                                    <Plus className="h-6 w-6 text-slate-400" />
                                  </label>
                                </div>

                                {/* Display Selected Files */}
                                {newProject.pictures && Array.from(newProject.pictures).map((file, index) => (
                                  <motion.div
                                    key={index}
                                    {...fadeInUp}
                                    className="border border-slate-200 rounded-lg p-3 bg-white min-w-[200px] flex-shrink-0"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h3 className="text-lg font-medium text-slate-800">
                                          Picture #{index + 1}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-1 truncate">
                                          {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                          {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            if (newProject.pictures) {
                                              const fileArray = Array.from(newProject.pictures);
                                              fileArray.splice(index, 1);
                                              const dataTransfer = new DataTransfer();
                                              fileArray.forEach(file => dataTransfer.items.add(file));
                                              setNewProject({...newProject, pictures: dataTransfer.files});
                                            }
                                          }}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="clientFeedback">Client Feedback (Optional)</Label>
                          <Textarea
                            id="clientFeedback"
                            rows={3}
                            placeholder="Client testimonial or feedback..."
                            value={newProject.clientFeedback || ""}
                            onChange={(e) => setNewProject({...newProject, clientFeedback: e.target.value})}
                          />
                        </div>
                        
                        <Button 
                          onClick={addProjectFromModal}
                          className="w-full bg-primary hover:bg-blue-700"
                          disabled={!newProject.title || !newProject.description}
                        >
                          {editingProjectIndex !== null ? 'Save' : 'Add Project'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Display Added Projects in Horizontal Slider */}
                  {projects.map((project, index) => (
                    <motion.div
                      key={index}
                      {...fadeInUp}
                      className="border border-slate-200 rounded-lg p-4 bg-white min-w-[280px] flex-shrink-0"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium text-slate-800">
                            Project #{index + 1}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {project.title || "Untitled Project"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProject(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => editProject(index)}
                            className="text-primary border-primary hover:bg-primary hover:text-white"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warranty Section */}
            <div className="space-y-6">
              <div 
                className={`transition-colors p-4 rounded-lg border border-slate-200 ${
                  showWarrantySection 
                    ? 'bg-slate-50' 
                    : 'cursor-pointer hover:bg-slate-100 bg-slate-50'
                }`}
              >
                <div
                  className={showWarrantySection ? '' : 'cursor-pointer'}
                  onClick={() => setShowWarrantySection(!showWarrantySection)}
                  data-testid="button-toggle-warranty-section"
                >
                  <h2 className="flex items-center text-xl text-slate-800 font-semibold">
                    <Shield className="text-primary mr-3 h-5 w-5" />
                    Warranty (optional)
                    {showWarrantySection ? (
                      <ChevronUp className="h-5 w-5 text-slate-600 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-600 ml-2" />
                    )}
                  </h2>
                </div>
              
                <AnimatePresence>
                  {showWarrantySection && (
                    <motion.div {...slideDown} className="mt-6">
                      <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="warrantyDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Warranty Description</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Describe your warranty terms and coverage..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Insurance Section */}
            <div className="space-y-6">
              <div 
                className={`transition-colors p-4 rounded-lg border border-slate-200 ${
                  showInsuranceSection 
                    ? 'bg-slate-50' 
                    : 'cursor-pointer hover:bg-slate-100 bg-slate-50'
                }`}
              >
                <div
                  className={showInsuranceSection ? '' : 'cursor-pointer'}
                  onClick={() => setShowInsuranceSection(!showInsuranceSection)}
                  data-testid="button-toggle-insurance-section"
                >
                  <h2 className="flex items-center text-xl text-slate-800 font-semibold">
                    <Shield className="text-primary mr-3 h-5 w-5" />
                    Insurance (optional)
                    {showInsuranceSection ? (
                      <ChevronUp className="h-5 w-5 text-slate-600 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-600 ml-2" />
                    )}
                  </h2>
                </div>
              
                <AnimatePresence>
                  {showInsuranceSection && (
                    <motion.div {...slideDown} className="mt-6">
                      <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="generalLiability"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>General Liability Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="$1,000,000" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bondedAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bonded Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="$50,000" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="workersCompensation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox 
                                checked={field.value || false} 
                                onCheckedChange={field.onChange}
                                className="h-5 w-5 rounded-sm border-2 border-primary"
                              />
                            </FormControl>
                            <FormLabel className="leading-none">Workers Compensation Coverage <span className="text-slate-500">(Optional)</span></FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalCoverage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Additional Coverage <span className="text-slate-500">(Optional)</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Additional insurance details..." {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Service Areas Section */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <MapPin className="text-primary mr-3 h-5 w-5" />
                  Service Areas
                </h2>
                
                {/* Add Area Input */}
                <div className="mb-4">
                  <Label htmlFor="areaInput" className="mb-2 block">Add area</Label>
                  <div className="flex gap-3">
                    <Input
                      id="areaInput"
                      placeholder="Enter area name"
                      value={newAreaName}
                      onChange={(e) => setNewAreaName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAreaFromInput()}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addAreaFromInput}
                      disabled={!newAreaName.trim()}
                      className="bg-primary hover:bg-blue-700 px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Display Added Areas */}
                {serviceAreas.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {serviceAreas.map((area, index) => (
                      <motion.div
                        key={index}
                        {...fadeInUp}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3"
                      >
                        <span className="text-slate-800 font-medium">
                          {area.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArea(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Description Input */}
                <div>
                  <Label htmlFor="areaDescription">Description of a specific area(s)</Label>
                  <Textarea
                    id="areaDescription"
                    rows={3}
                    placeholder="Provide additional details about your service areas..."
                    value={areaDescription}
                    onChange={(e) => setAreaDescription(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-8">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-primary hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-200 focus:outline-none"
              >
                {submitMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <NotebookPen className="mr-2 h-4 w-4" />
                    Submit Client Information
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
