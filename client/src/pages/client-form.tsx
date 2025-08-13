import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Trash2, Building, Tag, TriangleAlert, CircleOff, ServerCog, FolderOpen, Shield, MapPin, NotebookPen, UserCircle, ChevronDown, ChevronUp, Settings, Cloud, Info, Edit, Edit2, Check, X, DollarSign, CloudLightning, Award, Wrench, BookOpen, Package, ShieldCheck, Building2, ClipboardList, FileText, Medal, BadgeCheck, ArrowRight } from "lucide-react";
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
    name: z.string().optional(),
    description: z.string().optional(),
    steps: z.string().optional(),
    picture: z.any().optional(),
  })).optional().default([]),
  projects: z.array(z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    beforeAfter: z.boolean().default(false),
    beforePictures: z.any().optional(),
    afterPictures: z.any().optional(),
    pictures: z.any().optional(),
    clientFeedback: z.string().optional(),
  })).optional().default([]),
  serviceAreas: z.array(z.object({
    type: z.enum(['neighborhoods', 'cities', 'counties', 'radius']),
    name: z.string().optional(),
    description: z.string().optional(),
  })).optional().default([]),
});

type FormData = z.infer<typeof formSchema>;

// Utility function to upload images to Cloudinary
const uploadImages = async (files: FileList): Promise<string[]> => {
  if (!files || files.length === 0) return [];
  
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch('/api/upload-images', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload images');
  }

  const result = await response.json();
  return result.imageUrls;
};

interface Service {
  name: string;
  description: string;
  steps?: string;
  pictures?: FileList;
}

interface StormService {
  name: string;
  description: string;
  responseTime?: string;
  insurancePartnership?: string;
  pictures?: FileList;
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

interface FinancingOption {
  name: string;
  description: string;
  interestRate?: string;
  termLength?: string;
  minimumAmount?: string;
  qualificationRequirements?: string;
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
  const [stormServices, setStormServices] = useState<StormService[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([]);
  const [isTypingExperience, setIsTypingExperience] = useState(false);
  const experienceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showAboutSection, setShowAboutSection] = useState(false);
  const [showWarrantySection, setShowWarrantySection] = useState(false);
  const [showInsuranceSection, setShowInsuranceSection] = useState(false);
  const [showServiceAreasSection, setShowServiceAreasSection] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newService, setNewService] = useState<Service>({ name: "", description: "", steps: "" });
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);
  const [showStormServiceModal, setShowStormServiceModal] = useState(false);
  const [newStormService, setNewStormService] = useState<StormService>({ name: "", description: "", responseTime: "", insurancePartnership: "" });
  const [editingStormServiceIndex, setEditingStormServiceIndex] = useState<number | null>(null);
  const [showFinancingModal, setShowFinancingModal] = useState(false);
  const [newFinancingOption, setNewFinancingOption] = useState<FinancingOption>({ name: "", description: "", interestRate: "", termLength: "", minimumAmount: "", qualificationRequirements: "" });
  const [editingFinancingIndex, setEditingFinancingIndex] = useState<number | null>(null);
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
  const [brands, setBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCertification, setNewCertification] = useState("");
  const [certificationPictures, setCertificationPictures] = useState<FileList | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showResponseTimeTooltip, setShowResponseTimeTooltip] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tooltipClickedOpen, setTooltipClickedOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showInsuranceTooltip, setShowInsuranceTooltip] = useState(false);
  const [insuranceHoverTimeout, setInsuranceHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [insuranceTooltipClickedOpen, setInsuranceTooltipClickedOpen] = useState(false);
  const insuranceTooltipRef = useRef<HTMLDivElement>(null);
  const [showServiceDescTooltip, setShowServiceDescTooltip] = useState(false);
  const [serviceDescHoverTimeout, setServiceDescHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [serviceDescTooltipClickedOpen, setServiceDescTooltipClickedOpen] = useState(false);
  const serviceDescTooltipRef = useRef<HTMLDivElement>(null);
  const [showFinancingDescTooltip, setShowFinancingDescTooltip] = useState(false);
  const [financingDescHoverTimeout, setFinancingDescHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [financingDescTooltipClickedOpen, setFinancingDescTooltipClickedOpen] = useState(false);
  const financingDescTooltipRef = useRef<HTMLDivElement>(null);
  const [showInterestRateTooltip, setShowInterestRateTooltip] = useState(false);
  const [interestRateHoverTimeout, setInterestRateHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [interestRateTooltipClickedOpen, setInterestRateTooltipClickedOpen] = useState(false);
  const interestRateTooltipRef = useRef<HTMLDivElement>(null);
  const [showTermLengthTooltip, setShowTermLengthTooltip] = useState(false);
  const [termLengthHoverTimeout, setTermLengthHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [termLengthTooltipClickedOpen, setTermLengthTooltipClickedOpen] = useState(false);
  const termLengthTooltipRef = useRef<HTMLDivElement>(null);
  const [showMinAmountTooltip, setShowMinAmountTooltip] = useState(false);
  const [minAmountHoverTimeout, setMinAmountHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [minAmountTooltipClickedOpen, setMinAmountTooltipClickedOpen] = useState(false);
  const minAmountTooltipRef = useRef<HTMLDivElement>(null);
  const [showQualificationTooltip, setShowQualificationTooltip] = useState(false);
  const [qualificationHoverTimeout, setQualificationHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [qualificationTooltipClickedOpen, setQualificationTooltipClickedOpen] = useState(false);
  const qualificationTooltipRef = useRef<HTMLDivElement>(null);
  const [showMaintenanceGuideTooltip, setShowMaintenanceGuideTooltip] = useState(false);
  const [maintenanceGuideHoverTimeout, setMaintenanceGuideHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [maintenanceGuideTooltipClickedOpen, setMaintenanceGuideTooltipClickedOpen] = useState(false);
  const maintenanceGuideTooltipRef = useRef<HTMLDivElement>(null);
  const [showBusinessHoursTooltip, setShowBusinessHoursTooltip] = useState(false);
  const [businessHoursHoverTimeout, setBusinessHoursHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [businessHoursTooltipClickedOpen, setBusinessHoursTooltipClickedOpen] = useState(false);
  const businessHoursTooltipRef = useRef<HTMLDivElement>(null);

  // Service Steps state
  const [serviceSteps, setServiceSteps] = useState<Array<{serviceName: string; steps: string[]; additionalNotes: string; pictures: FileList | null}>>([]);
  const [isServiceStepsModalOpen, setIsServiceStepsModalOpen] = useState(false);
  const [newServiceStep, setNewServiceStep] = useState({
    serviceName: "",
    steps: [] as string[],
    additionalNotes: "",
    pictures: null as FileList | null
  });
  const [editingServiceStepIndex, setEditingServiceStepIndex] = useState<number | null>(null);
  const [newStepInput, setNewStepInput] = useState("");
  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editingStepValue, setEditingStepValue] = useState("");
  
  // Maintenance Tips state
  const [maintenanceTips, setMaintenanceTips] = useState<string[]>([]);
  const [newTipInput, setNewTipInput] = useState("");
  const [editingTipIndex, setEditingTipIndex] = useState<number | null>(null);
  const [editingTipValue, setEditingTipValue] = useState("");

  // Warranty Terms state
  const [warrantyTerms, setWarrantyTerms] = useState<string[]>([]);
  const [newWarrantyTermInput, setNewWarrantyTermInput] = useState("");
  const [editingWarrantyTermIndex, setEditingWarrantyTermIndex] = useState<number | null>(null);
  const [editingWarrantyTermValue, setEditingWarrantyTermValue] = useState("");



  // Handle click outside to close tooltips
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle response time tooltip
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && tooltipClickedOpen) {
        setShowResponseTimeTooltip(false);
        setTooltipClickedOpen(false);
      }
      // Handle insurance tooltip
      if (insuranceTooltipRef.current && !insuranceTooltipRef.current.contains(event.target as Node) && insuranceTooltipClickedOpen) {
        setShowInsuranceTooltip(false);
        setInsuranceTooltipClickedOpen(false);
      }
      // Handle service description tooltip
      if (serviceDescTooltipRef.current && !serviceDescTooltipRef.current.contains(event.target as Node) && serviceDescTooltipClickedOpen) {
        setShowServiceDescTooltip(false);
        setServiceDescTooltipClickedOpen(false);
      }
      // Handle financing description tooltip
      if (financingDescTooltipRef.current && !financingDescTooltipRef.current.contains(event.target as Node) && financingDescTooltipClickedOpen) {
        setShowFinancingDescTooltip(false);
        setFinancingDescTooltipClickedOpen(false);
      }
      // Handle interest rate tooltip
      if (interestRateTooltipRef.current && !interestRateTooltipRef.current.contains(event.target as Node) && interestRateTooltipClickedOpen) {
        setShowInterestRateTooltip(false);
        setInterestRateTooltipClickedOpen(false);
      }
      // Handle term length tooltip
      if (termLengthTooltipRef.current && !termLengthTooltipRef.current.contains(event.target as Node) && termLengthTooltipClickedOpen) {
        setShowTermLengthTooltip(false);
        setTermLengthTooltipClickedOpen(false);
      }
      // Handle minimum amount tooltip
      if (minAmountTooltipRef.current && !minAmountTooltipRef.current.contains(event.target as Node) && minAmountTooltipClickedOpen) {
        setShowMinAmountTooltip(false);
        setMinAmountTooltipClickedOpen(false);
      }
      // Handle qualification tooltip
      if (qualificationTooltipRef.current && !qualificationTooltipRef.current.contains(event.target as Node) && qualificationTooltipClickedOpen) {
        setShowQualificationTooltip(false);
        setQualificationTooltipClickedOpen(false);
      }
      // Handle business hours tooltip
      if (businessHoursTooltipRef.current && !businessHoursTooltipRef.current.contains(event.target as Node) && businessHoursTooltipClickedOpen) {
        setShowBusinessHoursTooltip(false);
        setBusinessHoursTooltipClickedOpen(false);
      }
    };

    if ((showResponseTimeTooltip && tooltipClickedOpen) || (showInsuranceTooltip && insuranceTooltipClickedOpen) || (showServiceDescTooltip && serviceDescTooltipClickedOpen) || (showFinancingDescTooltip && financingDescTooltipClickedOpen) || (showInterestRateTooltip && interestRateTooltipClickedOpen) || (showTermLengthTooltip && termLengthTooltipClickedOpen) || (showMinAmountTooltip && minAmountTooltipClickedOpen) || (showQualificationTooltip && qualificationTooltipClickedOpen) || (showBusinessHoursTooltip && businessHoursTooltipClickedOpen)) {
      // Use a slight delay to avoid immediate closure when opening via click
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResponseTimeTooltip, tooltipClickedOpen, showInsuranceTooltip, insuranceTooltipClickedOpen, showServiceDescTooltip, serviceDescTooltipClickedOpen, showFinancingDescTooltip, financingDescTooltipClickedOpen, showInterestRateTooltip, interestRateTooltipClickedOpen, showTermLengthTooltip, termLengthTooltipClickedOpen, showMinAmountTooltip, minAmountTooltipClickedOpen, showQualificationTooltip, qualificationTooltipClickedOpen, showBusinessHoursTooltip, businessHoursTooltipClickedOpen]);

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
      hasFinancingOptions: false,
      financingDetails: "",
      hasStormServices: false,
      stormServiceDetails: "",
      hasBrandsWorkedWith: false,
      brandsWorkedWith: "",
      hasInstallationProcess: false,
      installationProcessDetails: "",
      hasMaintenanceGuide: false,
      maintenanceGuide: "",
      hasRoofMaterials: false,
      roofMaterialsDetails: "",
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
      // Keep all form data intact after successful submission
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Upload all service images to Cloudinary first
      const processedServices = await Promise.all(
        services.map(async (service) => {
          const pictureUrls = service.pictures ? await uploadImages(service.pictures) : [];
          return {
            name: service.name,
            description: service.description,
            steps: service.steps,
            pictureUrls: pictureUrls.length > 0 ? pictureUrls : undefined,
          };
        })
      );

      // Upload all project images to Cloudinary
      const processedProjects = await Promise.all(
        projects.map(async (project) => {
          const [beforePictureUrls, afterPictureUrls, pictureUrls] = await Promise.all([
            project.beforePictures ? uploadImages(project.beforePictures) : [],
            project.afterPictures ? uploadImages(project.afterPictures) : [],
            project.pictures ? uploadImages(project.pictures) : [],
          ]);

          return {
            title: project.title,
            description: project.description,
            beforeAfter: project.beforeAfter,
            beforePictureUrls: beforePictureUrls.length > 0 ? beforePictureUrls : undefined,
            afterPictureUrls: afterPictureUrls.length > 0 ? afterPictureUrls : undefined,
            pictureUrls: pictureUrls.length > 0 ? pictureUrls : undefined,
            clientFeedback: project.clientFeedback,
          };
        })
      );

      // Process the form data with uploaded image URLs
      const processedData: InsertClientSubmission = {
        ...data,
        services: processedServices,
        projects: processedProjects,
        serviceAreas,
        serviceAreasDescription: areaDescription,
      };

      submitMutation.mutate(processedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    }
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

  const addBrand = () => {
    if (newBrand.trim() && !brands.includes(newBrand.trim())) {
      setBrands([...brands, newBrand.trim()]);
      setNewBrand("");
    }
  };

  const removeBrand = (index: number) => {
    setBrands(brands.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const handleCertificationKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCertification();
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleBrandKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBrand();
    }
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: any) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addStormServiceFromModal = () => {
    if (newStormService.name && newStormService.description) {
      if (editingStormServiceIndex !== null) {
        // Update existing storm service
        const updatedStormServices = [...stormServices];
        updatedStormServices[editingStormServiceIndex] = { ...newStormService };
        setStormServices(updatedStormServices);
        setEditingStormServiceIndex(null);
      } else {
        // Add new storm service
        setStormServices([...stormServices, { ...newStormService }]);
      }
      setNewStormService({ name: "", description: "", responseTime: "", insurancePartnership: "" });
      setShowStormServiceModal(false);
    }
  };

  const editStormService = (index: number) => {
    setNewStormService({ ...stormServices[index] });
    setEditingStormServiceIndex(index);
    setShowStormServiceModal(true);
  };

  const removeStormService = (index: number) => {
    setStormServices(stormServices.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { title: "", description: "", beforeAfter: false }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addServiceStepFromModal = () => {
    if (newServiceStep.serviceName && newServiceStep.steps.length > 0 && newServiceStep.steps.some(step => step.trim())) {
      const filteredSteps = newServiceStep.steps.filter(step => step.trim());
      const serviceToAdd = {
        ...newServiceStep,
        steps: filteredSteps
      };
      
      if (editingServiceStepIndex !== null) {
        // Update existing service step
        const updatedSteps = [...serviceSteps];
        updatedSteps[editingServiceStepIndex] = serviceToAdd;
        setServiceSteps(updatedSteps);
        setEditingServiceStepIndex(null);
      } else {
        // Add new service step
        setServiceSteps([...serviceSteps, serviceToAdd]);
      }
      
      setNewServiceStep({
        serviceName: "",
        steps: [],
        additionalNotes: "",
        pictures: null
      });
      setNewStepInput("");
      setIsServiceStepsModalOpen(false);
    }
  };

  const editServiceStep = (index: number) => {
    setNewServiceStep({ ...serviceSteps[index] });
    setEditingServiceStepIndex(index);
    setIsServiceStepsModalOpen(true);
  };

  const removeServiceStep = (index: number) => {
    setServiceSteps(serviceSteps.filter((_, i) => i !== index));
  };

  // Add step from input (similar to Service Areas pattern)
  const addStepFromInput = () => {
    if (newStepInput.trim()) {
      setNewServiceStep({
        ...newServiceStep,
        steps: [...newServiceStep.steps, newStepInput.trim()]
      });
      setNewStepInput("");
    }
  };

  // Remove step from service (similar to Service Areas pattern)
  const removeStepFromService = (index: number) => {
    const updatedSteps = newServiceStep.steps.filter((_, i) => i !== index);
    setNewServiceStep({...newServiceStep, steps: updatedSteps});
  };

  // Edit step inline
  const startEditingStep = (index: number) => {
    setEditingStepIndex(index);
    setEditingStepValue(newServiceStep.steps[index]);
  };

  const saveEditingStep = (index: number) => {
    if (editingStepValue.trim()) {
      const updatedSteps = [...newServiceStep.steps];
      updatedSteps[index] = editingStepValue.trim();
      setNewServiceStep({...newServiceStep, steps: updatedSteps});
    }
    setEditingStepIndex(null);
    setEditingStepValue("");
  };

  const cancelEditingStep = () => {
    setEditingStepIndex(null);
    setEditingStepValue("");
  };

  // Move step to first position
  const moveStepToFirst = (index: number) => {
    if (index === 0) return; // Already first
    const steps = [...newServiceStep.steps];
    const [movedStep] = steps.splice(index, 1);
    steps.unshift(movedStep);
    setNewServiceStep({...newServiceStep, steps});
  };

  // Move step to last position
  const moveStepToLast = (index: number) => {
    if (index === newServiceStep.steps.length - 1) return; // Already last
    const steps = [...newServiceStep.steps];
    const [movedStep] = steps.splice(index, 1);
    steps.push(movedStep);
    setNewServiceStep({...newServiceStep, steps});
  };

  // Handle double click for PC
  const handleStepDoubleClick = (index: number) => {
    // Toggle between first and last position
    if (index === 0) {
      moveStepToLast(index);
    } else {
      moveStepToFirst(index);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedStepIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedStepIndex === null || draggedStepIndex === dropIndex) return;

    const steps = [...newServiceStep.steps];
    const [draggedStep] = steps.splice(draggedStepIndex, 1);
    steps.splice(dropIndex, 0, draggedStep);
    
    setNewServiceStep({...newServiceStep, steps});
    setDraggedStepIndex(null);
  };

  // Maintenance Tips Handlers
  const addMaintenanceTip = () => {
    if (newTipInput.trim()) {
      setMaintenanceTips([...maintenanceTips, newTipInput.trim()]);
      setNewTipInput("");
    }
  };

  const removeMaintenanceTip = (index: number) => {
    setMaintenanceTips(maintenanceTips.filter((_, i) => i !== index));
  };

  const startEditingTip = (index: number) => {
    setEditingTipIndex(index);
    setEditingTipValue(maintenanceTips[index]);
  };

  const saveEditingTip = () => {
    if (editingTipIndex !== null && editingTipValue.trim()) {
      const updatedTips = [...maintenanceTips];
      updatedTips[editingTipIndex] = editingTipValue.trim();
      setMaintenanceTips(updatedTips);
      setEditingTipIndex(null);
      setEditingTipValue("");
    }
  };

  const cancelEditingTip = () => {
    setEditingTipIndex(null);
    setEditingTipValue("");
  };

  // Warranty Terms Handlers
  const addWarrantyTerm = () => {
    if (newWarrantyTermInput.trim()) {
      setWarrantyTerms([...warrantyTerms, newWarrantyTermInput.trim()]);
      setNewWarrantyTermInput("");
    }
  };

  const removeWarrantyTerm = (index: number) => {
    setWarrantyTerms(warrantyTerms.filter((_, i) => i !== index));
  };

  const startEditingWarrantyTerm = (index: number) => {
    setEditingWarrantyTermIndex(index);
    setEditingWarrantyTermValue(warrantyTerms[index]);
  };

  const saveEditingWarrantyTerm = () => {
    if (editingWarrantyTermIndex !== null && editingWarrantyTermValue.trim()) {
      const updatedTerms = [...warrantyTerms];
      updatedTerms[editingWarrantyTermIndex] = editingWarrantyTermValue.trim();
      setWarrantyTerms(updatedTerms);
      setEditingWarrantyTermIndex(null);
      setEditingWarrantyTermValue("");
    }
  };

  const cancelEditingWarrantyTerm = () => {
    setEditingWarrantyTermIndex(null);
    setEditingWarrantyTermValue("");
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

  // Financing Options Handlers
  const addFinancingOptionFromModal = () => {
    if (newFinancingOption.name && newFinancingOption.description) {
      if (editingFinancingIndex !== null) {
        // Update existing financing option
        const updatedOptions = [...financingOptions];
        updatedOptions[editingFinancingIndex] = { ...newFinancingOption };
        setFinancingOptions(updatedOptions);
        setEditingFinancingIndex(null);
      } else {
        // Add new financing option
        setFinancingOptions([...financingOptions, { ...newFinancingOption }]);
      }
      setNewFinancingOption({ name: "", description: "", interestRate: "", termLength: "", minimumAmount: "", qualificationRequirements: "" });
      setShowFinancingModal(false);
    }
  };

  const editFinancingOption = (index: number) => {
    setNewFinancingOption({ ...financingOptions[index] });
    setEditingFinancingIndex(index);
    setShowFinancingModal(true);
  };

  const removeFinancingOption = (index: number) => {
    setFinancingOptions(financingOptions.filter((_, i) => i !== index));
  };

  const hasLicense = form.watch("hasLicense");
  const hasEmergencyServices = form.watch("hasEmergencyServices");
  const hasEmergencyPhone = form.watch("hasEmergencyPhone");

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
            Information Collection Form
          </h1>
          <div className="w-24 h-1 bg-black mx-auto rounded-full"></div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
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
                        <FormLabel>Business Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Use personal email if no business email available" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
            </div>

            <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasLicense"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have a license number?</FormLabel>
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
                            <FormLabel>License Number</FormLabel>
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
                      <FormLabel className="flex items-center gap-2">
                        Business Hours <span className="text-slate-500">(Optional)</span>
                        <div className="relative" ref={businessHoursTooltipRef}>
                          <Info
                            className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer"
                            onMouseEnter={() => {
                              if (businessHoursHoverTimeout) {
                                clearTimeout(businessHoursHoverTimeout);
                              }
                              const timeout = setTimeout(() => {
                                setShowBusinessHoursTooltip(true);
                              }, 500);
                              setBusinessHoursHoverTimeout(timeout);
                            }}
                            onMouseLeave={() => {
                              if (businessHoursHoverTimeout) {
                                clearTimeout(businessHoursHoverTimeout);
                                setBusinessHoursHoverTimeout(null);
                              }
                              if (!businessHoursTooltipClickedOpen) {
                                setShowBusinessHoursTooltip(false);
                              }
                            }}
                            onClick={() => {
                              setBusinessHoursTooltipClickedOpen(!businessHoursTooltipClickedOpen);
                              setShowBusinessHoursTooltip(!showBusinessHoursTooltip);
                            }}
                          />
                          {showBusinessHoursTooltip && (
                            <div className="absolute z-50 left-0 top-6 w-80 bg-slate-800 text-white text-sm p-3 rounded-md shadow-lg">
                              <p className="mb-2">Enter the days and times your business is open to serve customers.</p>
                              <p className="mb-2"><strong>Examples:</strong> "Monday-Friday 8AM–6PM, Saturday 9AM–4PM."</p>
                              <p>This helps customers know when they can reach you or schedule services.</p>
                            </div>
                          )}
                        </div>
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

            <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="hasEmergencyServices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you offer emergency services?</FormLabel>
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
                                  <FormLabel>Emergency Phone Number</FormLabel>
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

            {/* Additional Notes Section */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Any additional information or notes you'd like to share..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  onClick={() => {
                    const newShowState = !showAboutSection;
                    setShowAboutSection(newShowState);
                    // Automatically set enableAboutModifications to true when section is opened
                    if (newShowState) {
                      form.setValue('enableAboutModifications', true);
                    }
                  }}
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
                            <FormLabel>What Sets You Apart</FormLabel>
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
                            <FormLabel>Specific Specialties</FormLabel>
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
                  Services Customization (optional)
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
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle>
                          {editingServiceIndex !== null 
                            ? `Service #${editingServiceIndex + 1}` 
                            : `Service #${services.length + 1}`
                          }
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto">
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
                          <Label htmlFor="servicePictures">Service Pictures</Label>
                          <div className="w-full">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" style={{maxWidth: '100%'}}>
                              {/* Add Pictures Button */}
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[160px] flex-shrink-0">
                                <input
                                  id="servicePictures"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      const newFiles = Array.from(e.target.files);
                                      const existingFiles = newService.pictures ? Array.from(newService.pictures) : [];
                                      const allFiles = [...existingFiles, ...newFiles];
                                      
                                      const dataTransfer = new DataTransfer();
                                      allFiles.forEach((file: File) => dataTransfer.items.add(file));
                                      
                                      setNewService({...newService, pictures: dataTransfer.files});
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor="servicePictures" 
                                  className="flex flex-col items-center text-center cursor-pointer"
                                >
                                  <span className="text-slate-600 font-medium mb-2">Add Pictures</span>
                                  <Plus className="h-6 w-6 text-slate-400" />
                                </label>
                              </div>

                              {/* Display Selected Files */}
                              {newService.pictures && Array.from(newService.pictures).map((file: File, index) => (
                                <motion.div
                                  key={index}
                                  {...fadeInUp}
                                  className="border border-slate-200 rounded-lg p-2 bg-white min-w-[160px] flex-shrink-0"
                                >
                                  <div className="space-y-2">
                                    {/* Image Preview */}
                                    <div className="w-full h-20 bg-slate-100 rounded border overflow-hidden">
                                      <img 
                                        src={URL.createObjectURL(file)} 
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    {/* Delete Button */}
                                    <div className="flex justify-end">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (newService.pictures) {
                                            const fileArray = Array.from(newService.pictures);
                                            fileArray.splice(index, 1);
                                            const dataTransfer = new DataTransfer();
                                            fileArray.forEach((file: File) => dataTransfer.items.add(file));
                                            setNewService({...newService, pictures: dataTransfer.files});
                                          }
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={addServiceFromModal}
                          className="w-full bg-primary hover:bg-blue-700"
                        >
                          {editingServiceIndex !== null ? 'Save' : 'Add Service'}
                        </Button>
                        </div>
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
                    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader className="flex-shrink-0">
                        <DialogTitle>
                          {editingProjectIndex !== null 
                            ? `Project #${editingProjectIndex + 1}` 
                            : `Project #${projects.length + 1}`
                          }
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto">
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
                            <div className="space-y-6">
                              {/* Before Pictures */}
                              <div>
                                <Label htmlFor="beforePictures">Before Pictures</Label>
                                <div className="w-full">
                                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" style={{maxWidth: '100%'}}>
                                    {/* Add Before Pictures Button */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[200px] flex-shrink-0">
                                      <input
                                        id="beforePictures"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files.length > 0) {
                                            const newFiles = Array.from(e.target.files);
                                            const existingFiles = newProject.beforePictures ? Array.from(newProject.beforePictures) : [];
                                            const allFiles = [...existingFiles, ...newFiles];
                                            
                                            const dataTransfer = new DataTransfer();
                                            allFiles.forEach(file => dataTransfer.items.add(file));
                                            
                                            setNewProject({...newProject, beforePictures: dataTransfer.files});
                                            e.target.value = '';
                                          }
                                        }}
                                      />
                                      <label 
                                        htmlFor="beforePictures" 
                                        className="flex flex-col items-center text-center cursor-pointer"
                                      >
                                        <span className="text-slate-600 font-medium mb-2">Add Before Pictures</span>
                                        <Plus className="h-6 w-6 text-slate-400" />
                                      </label>
                                    </div>

                                    {/* Display Before Pictures */}
                                    {newProject.beforePictures && Array.from(newProject.beforePictures).map((file, index) => (
                                      <motion.div
                                        key={index}
                                        {...fadeInUp}
                                        className="border border-slate-200 rounded-lg p-3 bg-white min-w-[200px] flex-shrink-0"
                                      >
                                        <div className="space-y-2">
                                          {/* Image Preview */}
                                          <div className="w-full h-20 bg-slate-100 rounded border overflow-hidden">
                                            <img 
                                              src={URL.createObjectURL(file)} 
                                              alt={`Before Preview ${index + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>

                                          {/* Delete Button */}
                                          <div className="flex justify-end">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                if (newProject.beforePictures) {
                                                  const fileArray = Array.from(newProject.beforePictures);
                                                  fileArray.splice(index, 1);
                                                  const dataTransfer = new DataTransfer();
                                                  fileArray.forEach(file => dataTransfer.items.add(file));
                                                  setNewProject({...newProject, beforePictures: dataTransfer.files});
                                                }
                                              }}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* After Pictures */}
                              <div>
                                <Label htmlFor="afterPictures">After Pictures</Label>
                                <div className="w-full">
                                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" style={{maxWidth: '100%'}}>
                                    {/* Add After Pictures Button */}
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[200px] flex-shrink-0">
                                      <input
                                        id="afterPictures"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files.length > 0) {
                                            const newFiles = Array.from(e.target.files);
                                            const existingFiles = newProject.afterPictures ? Array.from(newProject.afterPictures) : [];
                                            const allFiles = [...existingFiles, ...newFiles];
                                            
                                            const dataTransfer = new DataTransfer();
                                            allFiles.forEach(file => dataTransfer.items.add(file));
                                            
                                            setNewProject({...newProject, afterPictures: dataTransfer.files});
                                            e.target.value = '';
                                          }
                                        }}
                                      />
                                      <label 
                                        htmlFor="afterPictures" 
                                        className="flex flex-col items-center text-center cursor-pointer"
                                      >
                                        <span className="text-slate-600 font-medium mb-2">Add After Pictures</span>
                                        <Plus className="h-6 w-6 text-slate-400" />
                                      </label>
                                    </div>

                                    {/* Display After Pictures */}
                                    {newProject.afterPictures && Array.from(newProject.afterPictures).map((file, index) => (
                                      <motion.div
                                        key={index}
                                        {...fadeInUp}
                                        className="border border-slate-200 rounded-lg p-3 bg-white min-w-[200px] flex-shrink-0"
                                      >
                                        <div className="space-y-2">
                                          {/* Image Preview */}
                                          <div className="w-full h-20 bg-slate-100 rounded border overflow-hidden">
                                            <img 
                                              src={URL.createObjectURL(file)} 
                                              alt={`After Preview ${index + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>

                                          {/* Delete Button */}
                                          <div className="flex justify-end">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                if (newProject.afterPictures) {
                                                  const fileArray = Array.from(newProject.afterPictures);
                                                  fileArray.splice(index, 1);
                                                  const dataTransfer = new DataTransfer();
                                                  fileArray.forEach(file => dataTransfer.items.add(file));
                                                  setNewProject({...newProject, afterPictures: dataTransfer.files});
                                                }
                                              }}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Label htmlFor="projectPictures">Project Pictures</Label>
                              <div className="w-full">
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" style={{maxWidth: '100%'}}>
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
                                    <div className="space-y-2">
                                      {/* Image Preview */}
                                      <div className="w-full h-20 bg-slate-100 rounded border overflow-hidden">
                                        <img 
                                          src={URL.createObjectURL(file)} 
                                          alt={`Preview ${index + 1}`}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>

                                      {/* Delete Button */}
                                      <div className="flex justify-end">
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
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                                </div>
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
                        >
                          {editingProjectIndex !== null ? 'Save' : 'Add Project'}
                        </Button>
                        </div>
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





            {/* Dashed Line Separator */}
            <div className="border-t border-dashed border-slate-300 my-8"></div>

            {/* Optional Sections */}
            <div className="space-y-6">
              <div>
                <h2 className="flex items-center text-xl text-slate-800 font-semibold mb-6">
                  <div className="bg-slate-200 rounded-full p-2 mr-3">
                    <Plus className="text-primary h-5 w-5" strokeWidth={3} />
                  </div>
                  Features for your website
                </h2>
                
                {/* Service Areas (optional) */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => setShowServiceAreasSection(!showServiceAreasSection)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <MapPin className="text-primary mr-3 h-5 w-5" />
                          Service Areas (optional)
                        </h3>
                        {showServiceAreasSection ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {showServiceAreasSection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <div className="space-y-6">
                            {/* Add Area Input */}
                            <div className="mb-4 mt-4">
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
                              <Label htmlFor="areaDescription">Additional Descriptions/Notes</Label>
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Financing Options */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasFinancingOptions");
                        form.setValue("hasFinancingOptions", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <DollarSign className="text-primary mr-3 h-5 w-5" />
                          Financing Options (optional)
                        </h3>
                        {form.watch("hasFinancingOptions") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasFinancingOptions") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          {/* Financing Options Slider Layout */}
                          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 mt-4">
                            {/* Rectangle Add Financing Option Button */}
                            <Dialog open={showFinancingModal} onOpenChange={setShowFinancingModal}>
                              <DialogTrigger asChild>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[280px] flex-shrink-0">
                                  <div className="flex flex-col items-center text-center">
                                    <span className="text-slate-600 font-medium mb-2">Add Financing Option</span>
                                    <Plus className="h-6 w-6 text-slate-400" />
                                  </div>
                                </div>
                              </DialogTrigger>
                              
                              {/* Financing Option Modal */}
                              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader className="flex-shrink-0">
                                  <DialogTitle>
                                    {editingFinancingIndex !== null 
                                      ? `Financing Option #${editingFinancingIndex + 1}` 
                                      : `Financing Option #${financingOptions.length + 1}`
                                    }
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="flex-1 overflow-y-auto">
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="financingName">Plan Title *</Label>
                                      <Input
                                        id="financingName"
                                        placeholder="e.g., 0% APR for 12 months, Payment Plans"
                                        value={newFinancingOption.name}
                                        onChange={(e) => setNewFinancingOption({...newFinancingOption, name: e.target.value})}
                                      />
                                    </div>
                                    
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Label htmlFor="financingDescription">Full Plan Description *</Label>
                                        <div className="relative" ref={financingDescTooltipRef}>
                                          <Info 
                                            className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (financingDescHoverTimeout) {
                                                clearTimeout(financingDescHoverTimeout);
                                                setFinancingDescHoverTimeout(null);
                                              }
                                              const newState = !showFinancingDescTooltip;
                                              setShowFinancingDescTooltip(newState);
                                              setFinancingDescTooltipClickedOpen(newState);
                                            }}
                                            onMouseEnter={() => {
                                              if (!financingDescTooltipClickedOpen && !showFinancingDescTooltip) {
                                                const timeout = setTimeout(() => {
                                                  setShowFinancingDescTooltip(true);
                                                }, 800);
                                                setFinancingDescHoverTimeout(timeout);
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              if (financingDescHoverTimeout) {
                                                clearTimeout(financingDescHoverTimeout);
                                                setFinancingDescHoverTimeout(null);
                                              }
                                              // Only hide on mouse leave if it was shown by hover, not by click
                                              if (showFinancingDescTooltip && !financingDescTooltipClickedOpen) {
                                                setTimeout(() => setShowFinancingDescTooltip(false), 100);
                                              }
                                            }}
                                          />
                                          {showFinancingDescTooltip && (
                                            <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                              <div className="relative">
                                                Explain the details of this financing option—how it works, benefits, and any important conditions. Keep it clear and customer-friendly.
                                                <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Textarea
                                        id="financingDescription"
                                        rows={3}
                                        placeholder="Describe this financing option in detail..."
                                        value={newFinancingOption.description}
                                        onChange={(e) => setNewFinancingOption({...newFinancingOption, description: e.target.value})}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Label htmlFor="interestRate">Interest Rate (Optional)</Label>
                                          <div className="relative" ref={interestRateTooltipRef}>
                                            <Info 
                                              className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (interestRateHoverTimeout) {
                                                  clearTimeout(interestRateHoverTimeout);
                                                  setInterestRateHoverTimeout(null);
                                                }
                                                const newState = !showInterestRateTooltip;
                                                setShowInterestRateTooltip(newState);
                                                setInterestRateTooltipClickedOpen(newState);
                                              }}
                                              onMouseEnter={() => {
                                                if (!interestRateTooltipClickedOpen && !showInterestRateTooltip) {
                                                  const timeout = setTimeout(() => {
                                                    setShowInterestRateTooltip(true);
                                                  }, 800);
                                                  setInterestRateHoverTimeout(timeout);
                                                }
                                              }}
                                              onMouseLeave={() => {
                                                if (interestRateHoverTimeout) {
                                                  clearTimeout(interestRateHoverTimeout);
                                                  setInterestRateHoverTimeout(null);
                                                }
                                                if (showInterestRateTooltip && !interestRateTooltipClickedOpen) {
                                                  setTimeout(() => setShowInterestRateTooltip(false), 100);
                                                }
                                              }}
                                            />
                                            {showInterestRateTooltip && (
                                              <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                                <div className="relative">
                                                  Enter the annual interest rate for this plan. Examples: "0%" or "5.99% APR." Leave blank if not applicable.
                                                  <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <Input
                                          id="interestRate"
                                          placeholder="e.g., 0%, 5.99% APR"
                                          value={newFinancingOption.interestRate || ""}
                                          onChange={(e) => setNewFinancingOption({...newFinancingOption, interestRate: e.target.value})}
                                        />
                                      </div>
                                      
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <Label htmlFor="termLength">Term Length (Optional)</Label>
                                          <div className="relative" ref={termLengthTooltipRef}>
                                            <Info 
                                              className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (termLengthHoverTimeout) {
                                                  clearTimeout(termLengthHoverTimeout);
                                                  setTermLengthHoverTimeout(null);
                                                }
                                                const newState = !showTermLengthTooltip;
                                                setShowTermLengthTooltip(newState);
                                                setTermLengthTooltipClickedOpen(newState);
                                              }}
                                              onMouseEnter={() => {
                                                if (!termLengthTooltipClickedOpen && !showTermLengthTooltip) {
                                                  const timeout = setTimeout(() => {
                                                    setShowTermLengthTooltip(true);
                                                  }, 800);
                                                  setTermLengthHoverTimeout(timeout);
                                                }
                                              }}
                                              onMouseLeave={() => {
                                                if (termLengthHoverTimeout) {
                                                  clearTimeout(termLengthHoverTimeout);
                                                  setTermLengthHoverTimeout(null);
                                                }
                                                if (showTermLengthTooltip && !termLengthTooltipClickedOpen) {
                                                  setTimeout(() => setShowTermLengthTooltip(false), 100);
                                                }
                                              }}
                                            />
                                            {showTermLengthTooltip && (
                                              <div className="absolute right-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                                <div className="relative">
                                                  How long the financing lasts. Examples: "12 months" or "5 years." Leave blank if not applicable.
                                                  <div className="absolute -top-1 right-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <Input
                                          id="termLength"
                                          placeholder="e.g., 12 months, 5 years"
                                          value={newFinancingOption.termLength || ""}
                                          onChange={(e) => setNewFinancingOption({...newFinancingOption, termLength: e.target.value})}
                                        />
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Label htmlFor="minimumAmount">Minimum Amount (Optional)</Label>
                                        <div className="relative" ref={minAmountTooltipRef}>
                                          <Info 
                                            className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (minAmountHoverTimeout) {
                                                clearTimeout(minAmountHoverTimeout);
                                                setMinAmountHoverTimeout(null);
                                              }
                                              const newState = !showMinAmountTooltip;
                                              setShowMinAmountTooltip(newState);
                                              setMinAmountTooltipClickedOpen(newState);
                                            }}
                                            onMouseEnter={() => {
                                              if (!minAmountTooltipClickedOpen && !showMinAmountTooltip) {
                                                const timeout = setTimeout(() => {
                                                  setShowMinAmountTooltip(true);
                                                }, 800);
                                                setMinAmountHoverTimeout(timeout);
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              if (minAmountHoverTimeout) {
                                                clearTimeout(minAmountHoverTimeout);
                                                setMinAmountHoverTimeout(null);
                                              }
                                              if (showMinAmountTooltip && !minAmountTooltipClickedOpen) {
                                                setTimeout(() => setShowMinAmountTooltip(false), 100);
                                              }
                                            }}
                                          />
                                          {showMinAmountTooltip && (
                                            <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                              <div className="relative">
                                                The smallest project cost eligible for this financing. Examples: "$5,000" or "$10,000." Leave blank if not applicable.
                                                <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Input
                                        id="minimumAmount"
                                        placeholder="e.g., $5,000, $10,000"
                                        value={newFinancingOption.minimumAmount || ""}
                                        onChange={(e) => setNewFinancingOption({...newFinancingOption, minimumAmount: e.target.value})}
                                      />
                                    </div>
                                    
                                    <div>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Label htmlFor="qualificationRequirements">Qualification Requirements (Optional)</Label>
                                        <div className="relative" ref={qualificationTooltipRef}>
                                          <Info 
                                            className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (qualificationHoverTimeout) {
                                                clearTimeout(qualificationHoverTimeout);
                                                setQualificationHoverTimeout(null);
                                              }
                                              const newState = !showQualificationTooltip;
                                              setShowQualificationTooltip(newState);
                                              setQualificationTooltipClickedOpen(newState);
                                            }}
                                            onMouseEnter={() => {
                                              if (!qualificationTooltipClickedOpen && !showQualificationTooltip) {
                                                const timeout = setTimeout(() => {
                                                  setShowQualificationTooltip(true);
                                                }, 800);
                                                setQualificationHoverTimeout(timeout);
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              if (qualificationHoverTimeout) {
                                                clearTimeout(qualificationHoverTimeout);
                                                setQualificationHoverTimeout(null);
                                              }
                                              if (showQualificationTooltip && !qualificationTooltipClickedOpen) {
                                                setTimeout(() => setShowQualificationTooltip(false), 100);
                                              }
                                            }}
                                          />
                                          {showQualificationTooltip && (
                                            <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                              <div className="relative">
                                                Conditions customers must meet to qualify. Examples: "Credit score 650+," "Income verification required." Leave blank if not applicable.
                                                <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Textarea
                                        id="qualificationRequirements"
                                        rows={2}
                                        placeholder="e.g., Credit score 650+, Income verification required..."
                                        value={newFinancingOption.qualificationRequirements || ""}
                                        onChange={(e) => setNewFinancingOption({...newFinancingOption, qualificationRequirements: e.target.value})}
                                      />
                                    </div>
                                    
                                    <Button 
                                      onClick={addFinancingOptionFromModal}
                                      className="w-full bg-primary hover:bg-blue-700"
                                      disabled={!newFinancingOption.name || !newFinancingOption.description}
                                    >
                                      {editingFinancingIndex !== null ? 'Save Financing Option' : 'Add Financing Option'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Display Added Financing Options */}
                            {financingOptions.map((option, index) => (
                              <motion.div
                                key={index}
                                {...fadeInUp}
                                className="border border-slate-200 rounded-lg p-4 bg-white min-w-[280px] flex-shrink-0"
                              >
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-medium text-slate-800">
                                        {option.name || "Untitled Financing Option"}
                                      </h3>
                                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                        {option.description}
                                      </p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFinancingOption(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editFinancingOption(index)}
                                        className="text-primary border-primary hover:bg-primary hover:text-white"
                                      >
                                        Edit
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  {(option.interestRate || option.termLength || option.minimumAmount) && (
                                    <div className="flex flex-wrap gap-2">
                                      {option.interestRate && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                          {option.interestRate}
                                        </span>
                                      )}
                                      {option.termLength && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                          {option.termLength}
                                        </span>
                                      )}
                                      {option.minimumAmount && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                          Min: {option.minimumAmount}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Storm Services */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasStormServices");
                        form.setValue("hasStormServices", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <CloudLightning className="text-primary mr-3 h-5 w-5" />
                          Storm Services (optional)
                        </h3>
                        {form.watch("hasStormServices") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasStormServices") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          {/* Storm Services Slider Layout */}
                          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 mt-4">
                            {/* Rectangle Add Storm Service Button */}
                            <Dialog open={showStormServiceModal} onOpenChange={setShowStormServiceModal}>
                              <DialogTrigger asChild>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[280px] flex-shrink-0">
                                  <div className="flex flex-col items-center text-center">
                                    <span className="text-slate-600 font-medium mb-2">Add Storm Service</span>
                                    <Plus className="h-6 w-6 text-slate-400" />
                                  </div>
                                </div>
                              </DialogTrigger>
                              
                              {/* Storm Service Modal */}
                              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                                <DialogHeader className="flex-shrink-0">
                                  <DialogTitle>
                                    {editingStormServiceIndex !== null 
                                      ? `Storm Service #${editingStormServiceIndex + 1}` 
                                      : `Storm Service #${stormServices.length + 1}`
                                    }
                                  </DialogTitle>
                                </DialogHeader>
                                
                                <div className="flex-1 overflow-y-auto">
                                  <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="stormServiceName">Service Name *</Label>
                                    <Input
                                      id="stormServiceName"
                                      placeholder="e.g., Emergency Storm Response"
                                      value={newStormService.name}
                                      onChange={(e) => setNewStormService({...newStormService, name: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Label htmlFor="stormServiceDescription">Service Description *</Label>
                                      <div className="relative" ref={serviceDescTooltipRef}>
                                        <Info 
                                          className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (serviceDescHoverTimeout) {
                                                clearTimeout(serviceDescHoverTimeout);
                                                setServiceDescHoverTimeout(null);
                                              }
                                              const newState = !showServiceDescTooltip;
                                              setShowServiceDescTooltip(newState);
                                              setServiceDescTooltipClickedOpen(newState);
                                            }}
                                            onMouseEnter={() => {
                                              if (!serviceDescTooltipClickedOpen && !showServiceDescTooltip) {
                                                const timeout = setTimeout(() => {
                                                  setShowServiceDescTooltip(true);
                                                }, 800);
                                                setServiceDescHoverTimeout(timeout);
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              if (serviceDescHoverTimeout) {
                                                clearTimeout(serviceDescHoverTimeout);
                                                setServiceDescHoverTimeout(null);
                                              }
                                              // Only hide on mouse leave if it was shown by hover, not by click
                                              if (showServiceDescTooltip && !serviceDescTooltipClickedOpen) {
                                                setTimeout(() => setShowServiceDescTooltip(false), 100);
                                              }
                                            }}
                                          />
                                        {showServiceDescTooltip && (
                                          <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                            <div className="relative">
                                              Briefly describe what this storm service includes and why it helps customers after a storm. Keep it clear and focused (around 150 words).
                                              <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Textarea
                                      id="stormServiceDescription"
                                      rows={3}
                                      placeholder="Describe this storm service..."
                                      value={newStormService.description}
                                      onChange={(e) => setNewStormService({...newStormService, description: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Label htmlFor="responseTime">Response Time (Optional)</Label>
                                      <div className="relative" ref={tooltipRef}>
                                        <Info 
                                          className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (hoverTimeout) {
                                                clearTimeout(hoverTimeout);
                                                setHoverTimeout(null);
                                              }
                                              const newState = !showResponseTimeTooltip;
                                              setShowResponseTimeTooltip(newState);
                                              setTooltipClickedOpen(newState);
                                            }}
                                            onMouseEnter={() => {
                                              if (!tooltipClickedOpen && !showResponseTimeTooltip) {
                                                const timeout = setTimeout(() => {
                                                  setShowResponseTimeTooltip(true);
                                                }, 800);
                                                setHoverTimeout(timeout);
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              if (hoverTimeout) {
                                                clearTimeout(hoverTimeout);
                                                setHoverTimeout(null);
                                              }
                                              // Only hide on mouse leave if it was shown by hover, not by click
                                              if (showResponseTimeTooltip && !tooltipClickedOpen) {
                                                setTimeout(() => setShowResponseTimeTooltip(false), 100);
                                              }
                                            }}
                                          />
                                        {showResponseTimeTooltip && (
                                          <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                            <div className="relative">
                                              How quickly your team responds after a storm. Examples: "Same day," "Within 24 hours," or "2 hours for emergencies." Leave blank if not applicable.
                                              <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Input
                                      id="responseTime"
                                      placeholder="e.g., 24 hours, Same day"
                                      value={newStormService.responseTime || ""}
                                      onChange={(e) => setNewStormService({...newStormService, responseTime: e.target.value})}
                                    />
                                  </div>
                                  
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Label htmlFor="insurancePartnership">Insurance Partnership (Optional)</Label>
                                      <div className="relative" ref={insuranceTooltipRef}>
                                        <Info 
                                          className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              if (insuranceHoverTimeout) {
                                                clearTimeout(insuranceHoverTimeout);
                                                setInsuranceHoverTimeout(null);
                                              }
                                              const newState = !showInsuranceTooltip;
                                              setShowInsuranceTooltip(newState);
                                              setInsuranceTooltipClickedOpen(newState);
                                            }}
                                            onMouseEnter={() => {
                                              if (!insuranceTooltipClickedOpen && !showInsuranceTooltip) {
                                                const timeout = setTimeout(() => {
                                                  setShowInsuranceTooltip(true);
                                                }, 800);
                                                setInsuranceHoverTimeout(timeout);
                                              }
                                            }}
                                            onMouseLeave={() => {
                                              if (insuranceHoverTimeout) {
                                                clearTimeout(insuranceHoverTimeout);
                                                setInsuranceHoverTimeout(null);
                                              }
                                              // Only hide on mouse leave if it was shown by hover, not by click
                                              if (showInsuranceTooltip && !insuranceTooltipClickedOpen) {
                                                setTimeout(() => setShowInsuranceTooltip(false), 100);
                                              }
                                            }}
                                          />
                                        {showInsuranceTooltip && (
                                          <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-72">
                                            <div className="relative">
                                              Explain how you assist customers with insurance claims related to storm damage. Examples: "We work with all major insurance providers" or "Help with claim paperwork." If not applicable, write "N/A."
                                              <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <Textarea
                                      id="insurancePartnership"
                                      rows={2}
                                      placeholder="Details about working with insurance companies..."
                                      value={newStormService.insurancePartnership || ""}
                                      onChange={(e) => setNewStormService({...newStormService, insurancePartnership: e.target.value})}
                                    />
                                  </div>
                                  
                                  <Button 
                                    onClick={addStormServiceFromModal}
                                    className="w-full bg-primary hover:bg-blue-700"
                                    disabled={!newStormService.name || !newStormService.description}
                                  >
                                    {editingStormServiceIndex !== null ? 'Save Storm Service' : 'Add Storm Service'}
                                  </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Display Added Storm Services */}
                            {stormServices.map((stormService, index) => (
                              <motion.div
                                key={index}
                                {...fadeInUp}
                                className="border border-slate-200 rounded-lg p-4 bg-white min-w-[280px] flex-shrink-0"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="text-lg font-medium text-slate-800">
                                      Storm Service #{index + 1}
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                      {stormService.name || "Untitled Storm Service"}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeStormService(index)}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => editStormService(index)}
                                      className="text-primary border-primary hover:bg-primary hover:text-white"
                                    >
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Brands You Work With */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasBrandsWorkedWith");
                        form.setValue("hasBrandsWorkedWith", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <Award className="text-primary mr-3 h-5 w-5" />
                          Brands You Work With (optional)
                        </h3>
                        {form.watch("hasBrandsWorkedWith") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasBrandsWorkedWith") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <div className="space-y-4">
                            {/* Add Brand Input */}
                            <div>
                              <Label htmlFor="newBrand">Add Brand</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  id="newBrand"
                                  value={newBrand}
                                  onChange={(e) => setNewBrand(e.target.value)}
                                  onKeyPress={handleBrandKeyPress}
                                  placeholder="Enter brand name..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={addBrand}
                                  className="px-3"
                                  disabled={!newBrand.trim()}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Brand List */}
                            {brands.length > 0 && (
                              <div className="space-y-2">
                                <Label>Added Brands:</Label>
                                <div className="space-y-2">
                                  {brands.map((brand, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3"
                                    >
                                      <span className="text-slate-800 font-medium">{brand}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeBrand(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Additional Description */}
                            <FormField
                              control={form.control}
                              name="brandsWorkedWith"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Description/Notes (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      rows={3}
                                      placeholder="Add any additional notes about your brand partnerships..." 
                                      {...field} 
                                      value={field.value || ""} 
                                      data-testid="textarea-brands-description"
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

                {/* Certifications & Awards */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasCertificationsAwards");
                        form.setValue("hasCertificationsAwards", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <Medal className="text-primary mr-3 h-5 w-5" />
                          Certifications & Awards (optional)
                        </h3>
                        {form.watch("hasCertificationsAwards") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasCertificationsAwards") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <div className="space-y-4">
                            {/* Add Certification Input */}
                            <div>
                              <Label htmlFor="newCertification">Add Certification/Award</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  id="newCertification"
                                  value={newCertification}
                                  onChange={(e) => setNewCertification(e.target.value)}
                                  onKeyPress={handleCertificationKeyPress}
                                  placeholder="Enter certification or award..."
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={addCertification}
                                  className="px-3"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Certification Pictures */}
                            <div>
                              <Label htmlFor="certificationPictures">Pictures (optional)</Label>
                              <div className="w-full mt-2">
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" style={{maxWidth: '100%'}}>
                                  {/* Add Pictures Button */}
                                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[200px] flex-shrink-0">
                                    <input
                                      id="certificationPictures"
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                          const newFiles = Array.from(e.target.files);
                                          const existingFiles = certificationPictures ? Array.from(certificationPictures) : [];
                                          const allFiles = [...existingFiles, ...newFiles];
                                          
                                          const dataTransfer = new DataTransfer();
                                          allFiles.forEach(file => dataTransfer.items.add(file));
                                          
                                          setCertificationPictures(dataTransfer.files);
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                    <label 
                                      htmlFor="certificationPictures" 
                                      className="flex flex-col items-center text-center cursor-pointer"
                                    >
                                      <span className="text-slate-600 font-medium mb-2">Add Pictures</span>
                                      <Plus className="h-6 w-6 text-slate-400" />
                                    </label>
                                  </div>

                                  {/* Display uploaded pictures */}
                                  {certificationPictures && Array.from(certificationPictures).map((file, index) => (
                                    <motion.div
                                      key={index}
                                      {...fadeInUp}
                                      className="border border-slate-200 rounded-lg p-3 bg-white min-w-[200px] flex-shrink-0"
                                    >
                                      <div className="space-y-2">
                                        {/* Image Preview */}
                                        <div className="w-full h-20 bg-slate-100 rounded border overflow-hidden">
                                          <img 
                                            src={URL.createObjectURL(file)} 
                                            alt={`Certification ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>

                                        {/* Delete Button */}
                                        <div className="flex justify-end">
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const newFiles = Array.from(certificationPictures).filter((_, i) => i !== index);
                                              const dataTransfer = new DataTransfer();
                                              newFiles.forEach(file => dataTransfer.items.add(file));
                                              setCertificationPictures(newFiles.length > 0 ? dataTransfer.files : null);
                                            }}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Certifications List */}
                            {certifications.length > 0 && (
                              <div>
                                <Label>Certifications & Awards</Label>
                                <div className="space-y-2 mt-2">
                                  {certifications.map((certification, index) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3"
                                    >
                                      <span className="text-slate-800 font-medium">{certification}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeCertification(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Additional Description */}
                            <FormField
                              control={form.control}
                              name="certificationsAwards"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Description/Notes (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      rows={3}
                                      placeholder="Add any additional notes about your certifications and awards..." 
                                      {...field} 
                                      value={field.value || ""} 
                                      data-testid="textarea-certifications-description"
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

                {/* Installation Process */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasInstallationProcess");
                        form.setValue("hasInstallationProcess", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <Wrench className="text-primary mr-3 h-5 w-5" />
                          Installation Process (optional)
                        </h3>
                        {form.watch("hasInstallationProcess") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasInstallationProcess") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Service Steps</h3>
                            
                            {/* Service Steps Slider Layout */}
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                              {/* Rectangle Add Service Steps Button */}
                              <Dialog open={isServiceStepsModalOpen} onOpenChange={setIsServiceStepsModalOpen}>
                                <DialogTrigger asChild>
                                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[280px] flex-shrink-0">
                                    <div className="flex flex-col items-center text-center">
                                      <span className="text-slate-600 font-medium mb-2">Add Service Steps</span>
                                      <Plus className="h-6 w-6 text-slate-400" />
                                    </div>
                                  </div>
                                </DialogTrigger>

                                {/* Service Steps Modal */}
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                                  <DialogHeader className="flex-shrink-0">
                                    <DialogTitle>
                                      {editingServiceStepIndex !== null 
                                        ? `Service Steps #${editingServiceStepIndex + 1}` 
                                        : `Service Steps #${serviceSteps.length + 1}`
                                      }
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="flex-1 overflow-y-auto">
                                    <div className="space-y-4">
                                      {/* Service Name */}
                                      <div>
                                        <Label htmlFor="serviceName">Service Name *</Label>
                                        <Input
                                          id="serviceName"
                                          placeholder="e.g., Roof Installation, Repair Process"
                                          value={newServiceStep.serviceName}
                                          onChange={(e) => setNewServiceStep({...newServiceStep, serviceName: e.target.value})}
                                        />
                                      </div>
                                      
                                      {/* Add Step Input */}
                                      <div>
                                        <Label htmlFor="stepInput" className="mb-2 block">Add step</Label>
                                        <div className="flex gap-3 mb-4">
                                          <Input
                                            id="stepInput"
                                            placeholder="Enter step description"
                                            value={newStepInput}
                                            onChange={(e) => setNewStepInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && addStepFromInput()}
                                            className="flex-1"
                                          />
                                          <Button
                                            type="button"
                                            onClick={addStepFromInput}
                                            disabled={!newStepInput.trim()}
                                            className="bg-primary hover:bg-blue-700 px-3"
                                          >
                                            <Plus className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Display Added Steps */}
                                      {newServiceStep.steps.filter(step => step.trim()).length > 0 && (
                                        <div className="space-y-2 mb-4">
                                          <Label>Added Steps</Label>
                                          {newServiceStep.steps.map((step, index) => {
                                            if (!step.trim()) return null;
                                            return (
                                              <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, index)}
                                                onDoubleClick={() => handleStepDoubleClick(index)}
                                                className={`flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3 cursor-move hover:bg-slate-100 transition-colors ${
                                                  draggedStepIndex === index ? 'opacity-50 scale-105' : ''
                                                }`}
                                                title="Double-click to move to first/last position, or drag to reorder"
                                              >
                                                <div className="flex items-center gap-3 flex-1">
                                                  <span className="text-sm font-medium text-slate-500 bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center">
                                                    {index + 1}
                                                  </span>
                                                  {editingStepIndex === index ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                      <Input
                                                        value={editingStepValue}
                                                        onChange={(e) => setEditingStepValue(e.target.value)}
                                                        onKeyPress={(e) => {
                                                          if (e.key === 'Enter') {
                                                            saveEditingStep(index);
                                                          } else if (e.key === 'Escape') {
                                                            cancelEditingStep();
                                                          }
                                                        }}
                                                        className="flex-1 text-sm"
                                                        autoFocus
                                                      />
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => saveEditingStep(index)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
                                                        title="Save changes"
                                                      >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                      </Button>
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={cancelEditingStep}
                                                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 p-1"
                                                        title="Cancel"
                                                      >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                      </Button>
                                                    </div>
                                                  ) : (
                                                    <span className="text-slate-800 font-medium flex-1">
                                                      {step}
                                                    </span>
                                                  )}
                                                </div>
                                                {editingStepIndex !== index && (
                                                  <div className="flex items-center gap-2">
                                                    {/* Edit Button */}
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditingStep(index);
                                                      }}
                                                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                      title="Edit step"
                                                    >
                                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                      </svg>
                                                    </Button>
                                                    
                                                    {/* Delete Button */}
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeStepFromService(index);
                                                      }}
                                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                      title="Delete step"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                )}
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                      )}
                                      
                                      {/* Additional Notes */}
                                      <div>
                                        <Label htmlFor="serviceAdditionalNotes">Additional Notes/Description</Label>
                                        <Textarea
                                          id="serviceAdditionalNotes"
                                          rows={3}
                                          placeholder="Any additional notes or descriptions for this service..."
                                          value={newServiceStep.additionalNotes}
                                          onChange={(e) => setNewServiceStep({...newServiceStep, additionalNotes: e.target.value})}
                                        />
                                      </div>

                                      {/* Service Step Pictures */}
                                      <div>
                                        <Label htmlFor="serviceStepPictures">Add Pictures</Label>
                                        <div className="w-full">
                                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300" style={{maxWidth: '100%'}}>
                                            {/* Add Pictures Button */}
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors min-w-[160px] flex-shrink-0">
                                              <input
                                                id="serviceStepPictures"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                  if (e.target.files && e.target.files.length > 0) {
                                                    const newFiles = Array.from(e.target.files);
                                                    const existingFiles = newServiceStep.pictures ? Array.from(newServiceStep.pictures) : [];
                                                    const allFiles = [...existingFiles, ...newFiles];
                                                    
                                                    const dataTransfer = new DataTransfer();
                                                    allFiles.forEach((file: File) => dataTransfer.items.add(file));
                                                    
                                                    setNewServiceStep({...newServiceStep, pictures: dataTransfer.files});
                                                    e.target.value = '';
                                                  }
                                                }}
                                              />
                                              <label 
                                                htmlFor="serviceStepPictures" 
                                                className="flex flex-col items-center text-center cursor-pointer"
                                              >
                                                <span className="text-slate-600 font-medium mb-2">Add Pictures</span>
                                                <Plus className="h-6 w-6 text-slate-400" />
                                              </label>
                                            </div>

                                            {/* Display Selected Files */}
                                            {newServiceStep.pictures && Array.from(newServiceStep.pictures).map((file: File, index) => (
                                              <motion.div
                                                key={index}
                                                {...fadeInUp}
                                                className="border border-slate-200 rounded-lg p-2 bg-white min-w-[160px] flex-shrink-0"
                                              >
                                                <div className="space-y-2">
                                                  {/* Image Preview */}
                                                  <div className="w-full h-20 bg-slate-100 rounded border overflow-hidden">
                                                    <img 
                                                      src={URL.createObjectURL(file)} 
                                                      alt={`Preview ${index + 1}`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>

                                                  {/* Delete Button */}
                                                  <div className="flex justify-end">
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() => {
                                                        if (newServiceStep.pictures) {
                                                          const fileArray = Array.from(newServiceStep.pictures);
                                                          fileArray.splice(index, 1);
                                                          const dataTransfer = new DataTransfer();
                                                          fileArray.forEach((file: File) => dataTransfer.items.add(file));
                                                          setNewServiceStep({...newServiceStep, pictures: dataTransfer.files});
                                                        }
                                                      }}
                                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              </motion.div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <Button 
                                        onClick={addServiceStepFromModal}
                                        className="w-full bg-primary hover:bg-blue-700"
                                        disabled={!newServiceStep.serviceName || !newServiceStep.steps.some(step => step.trim())}
                                      >
                                        {editingServiceStepIndex !== null ? 'Save Service Steps' : 'Add Service Steps'}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {/* Display Added Service Steps in Horizontal Slider */}
                              {serviceSteps.map((service, index) => (
                                <motion.div
                                  key={index}
                                  {...fadeInUp}
                                  className="border border-slate-200 rounded-lg p-4 bg-white min-w-[280px] flex-shrink-0"
                                >
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className="text-lg font-medium text-slate-800">
                                        Service Steps #{index + 1}
                                      </h3>
                                      <p className="text-sm text-slate-600 mt-1">
                                        {service.serviceName || "Untitled Service"}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeServiceStep(index)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editServiceStep(index)}
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Roof Maintenance Guide */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasMaintenanceGuide");
                        form.setValue("hasMaintenanceGuide", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="flex items-center text-xl font-semibold text-slate-800">
                            <ClipboardList className="text-primary mr-3 h-5 w-5" />
                            Roof Maintenance Guide (optional)
                          </h3>
                          <div className="relative" ref={maintenanceGuideTooltipRef}>
                            <Info 
                              className="h-4 w-4 text-blue-600 hover:text-blue-700 cursor-pointer" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (maintenanceGuideHoverTimeout) {
                                  clearTimeout(maintenanceGuideHoverTimeout);
                                  setMaintenanceGuideHoverTimeout(null);
                                }
                                const newState = !showMaintenanceGuideTooltip;
                                setShowMaintenanceGuideTooltip(newState);
                                setMaintenanceGuideTooltipClickedOpen(newState);
                              }}
                              onMouseEnter={() => {
                                if (!maintenanceGuideTooltipClickedOpen && !showMaintenanceGuideTooltip) {
                                  const timeout = setTimeout(() => {
                                    setShowMaintenanceGuideTooltip(true);
                                  }, 800);
                                  setMaintenanceGuideHoverTimeout(timeout);
                                }
                              }}
                              onMouseLeave={() => {
                                if (maintenanceGuideHoverTimeout) {
                                  clearTimeout(maintenanceGuideHoverTimeout);
                                  setMaintenanceGuideHoverTimeout(null);
                                }
                                if (showMaintenanceGuideTooltip && !maintenanceGuideTooltipClickedOpen) {
                                  setTimeout(() => setShowMaintenanceGuideTooltip(false), 100);
                                }
                              }}
                            />
                            {showMaintenanceGuideTooltip && (
                              <div className="absolute left-0 top-6 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg z-50 w-80">
                                <div className="relative">
                                  This section lets you share helpful, practical tips your customers can use to maintain their roofs and avoid problems. Think seasonal advice, easy DIY checks, signs of damage to watch for, and when it's time to call a professional. Adding this content builds trust and shows your expertise.
                                  <div className="absolute -top-1 left-3 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {form.watch("hasMaintenanceGuide") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasMaintenanceGuide") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <div className="space-y-4">
                            {/* Add Tip Input */}
                            <div>
                              <Label htmlFor="addMaintenanceTip">Add a maintenance tip</Label>
                              <div className="flex gap-2 mt-2">
                                <Input
                                  id="addMaintenanceTip"
                                  placeholder="e.g., Check gutters for debris every 6 months"
                                  value={newTipInput}
                                  onChange={(e) => setNewTipInput(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addMaintenanceTip();
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  onClick={addMaintenanceTip}
                                  disabled={!newTipInput.trim()}
                                  className="bg-primary hover:bg-blue-700 px-3"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Display Added Tips */}
                            {maintenanceTips.length > 0 && (
                              <div className="space-y-2">
                                {maintenanceTips.map((tip, index) => (
                                  <motion.div
                                    key={index}
                                    {...fadeInUp}
                                    className="space-y-2"
                                  >
                                    <div className="text-sm font-medium text-slate-600">Tip #{index + 1}</div>
                                    <div className="border border-slate-300 rounded px-3 py-2 bg-white">
                                      {editingTipIndex === index ? (
                                        /* Edit Mode */
                                        <div className="flex items-center gap-2">
                                          <Input
                                            value={editingTipValue}
                                            onChange={(e) => setEditingTipValue(e.target.value)}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                saveEditingTip();
                                              } else if (e.key === 'Escape') {
                                                e.preventDefault();
                                                cancelEditingTip();
                                              }
                                            }}
                                            className="flex-1 bg-white"
                                            autoFocus
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={saveEditingTip}
                                            disabled={!editingTipValue.trim()}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                          >
                                            <Check className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={cancelEditingTip}
                                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        /* Display Mode */
                                        <div className="flex items-center justify-between">
                                          <span className="text-slate-700 flex-1">{tip}</span>
                                          <div className="flex items-center gap-1 ml-2">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => startEditingTip(index)}
                                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => removeMaintenanceTip(index)}
                                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Roof Materials and Brands */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => {
                        const currentValue = form.getValues("hasRoofMaterials");
                        form.setValue("hasRoofMaterials", !currentValue);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <Building2 className="text-primary mr-3 h-5 w-5" />
                          Roof Materials and Brands (optional)
                        </h3>
                        {form.watch("hasRoofMaterials") ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {form.watch("hasRoofMaterials") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <FormField
                            control={form.control}
                            name="roofMaterialsDetails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Specific materials and brands you specialize in</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    rows={3}
                                    placeholder="List the materials and brands you specialize in..." 
                                    {...field} 
                                    value={field.value || ""} 
                                    data-testid="textarea-roof-materials"
                                  />
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

                {/* Warranty (optional) */}
                <div className="mb-6">
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => setShowWarrantySection(!showWarrantySection)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <BadgeCheck className="text-primary mr-3 h-5 w-5" />
                          Warranty Coverage (optional)
                        </h3>
                        {showWarrantySection ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {showWarrantySection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
                          <div className="space-y-6">
                            {/* Warranty Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="warrantyDuration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Warranty Duration</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., 5 years, 10 years, Lifetime"
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
                                name="warrantyType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Warranty Type</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g., Materials & Labor, Limited Warranty, Full Coverage"
                                        {...field}
                                        value={field.value || ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Warranty Coverage Details */}
                            <FormField
                              control={form.control}
                              name="warrantyDescription"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Coverage Details</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={4}
                                      placeholder="e.g., Covers materials defects, workmanship issues, weather damage protection. Excludes acts of nature, improper maintenance..."
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Warranty Terms & Conditions */}
                            <div className="space-y-3">
                              <Label>Warranty Terms & Conditions (optional)</Label>
                              <div className="space-y-4">
                                {/* Add Term Input */}
                                <div>
                                  <Label htmlFor="addWarrantyTerm">Add warranty term or condition</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Input
                                      id="addWarrantyTerm"
                                      placeholder="e.g., Annual inspection required to maintain warranty"
                                      value={newWarrantyTermInput}
                                      onChange={(e) => setNewWarrantyTermInput(e.target.value)}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          addWarrantyTerm();
                                        }
                                      }}
                                      className="flex-1"
                                    />
                                    <Button
                                      type="button"
                                      onClick={addWarrantyTerm}
                                      disabled={!newWarrantyTermInput.trim()}
                                      className="bg-primary hover:bg-blue-700 px-3"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Display Added Terms */}
                                {warrantyTerms.length > 0 && (
                                  <div className="space-y-2">
                                    {warrantyTerms.map((term, index) => (
                                      <motion.div
                                        key={index}
                                        {...fadeInUp}
                                        className="space-y-2"
                                      >
                                        <div className="text-sm font-medium text-slate-600">Term #{index + 1}</div>
                                        <div className="border border-slate-300 rounded px-3 py-2 bg-white">
                                          {editingWarrantyTermIndex === index ? (
                                            /* Edit Mode */
                                            <div className="flex items-center gap-2">
                                              <Input
                                                value={editingWarrantyTermValue}
                                                onChange={(e) => setEditingWarrantyTermValue(e.target.value)}
                                                onKeyPress={(e) => {
                                                  if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    saveEditingWarrantyTerm();
                                                  } else if (e.key === 'Escape') {
                                                    e.preventDefault();
                                                    cancelEditingWarrantyTerm();
                                                  }
                                                }}
                                                className="flex-1 bg-white"
                                                autoFocus
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={saveEditingWarrantyTerm}
                                                disabled={!editingWarrantyTermValue.trim()}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                              >
                                                <Check className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={cancelEditingWarrantyTerm}
                                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          ) : (
                                            /* Display Mode */
                                            <div className="flex items-center justify-between">
                                              <span className="text-slate-700 flex-1">{term}</span>
                                              <div className="flex items-center gap-1 ml-2">
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => startEditingWarrantyTerm(index)}
                                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                  <Edit2 className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => removeWarrantyTerm(index)}
                                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Additional Notes/Description */}
                            <FormField
                              control={form.control}
                              name="warrantyAdditionalNotes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Notes/Description (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={3}
                                      placeholder="Add any additional warranty information, special conditions, or clarifications..."
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

                {/* Insurance (optional) */}
                <div>
                  <div className="border border-slate-200 rounded-lg bg-slate-100">
                    <div 
                      className="p-4 cursor-pointer hover:bg-slate-200 transition-colors rounded-t-lg"
                      onClick={() => setShowInsuranceSection(!showInsuranceSection)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center text-xl font-semibold text-slate-800">
                          <Shield className="text-primary mr-3 h-5 w-5" />
                          Insurance (optional)
                        </h3>
                        {showInsuranceSection ? (
                          <Minus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        ) : (
                          <Plus className="h-5 w-5 text-slate-500" strokeWidth={3} />
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {showInsuranceSection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-4 pb-4 pt-0 border-t border-slate-300"
                        >
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
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value || false}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Workers' Compensation Insurance
                                  </FormLabel>
                                </div>
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
              </div>
            </div>

            {/* Additional Features/Notes */}
            <div className="mt-8">
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-6">
                <Label htmlFor="additionalNotes" className="text-lg font-medium text-slate-700 mb-3 block">
                  Notes/Additional features you want to add
                </Label>
                <Textarea
                  id="additionalNotes"
                  rows={4}
                  placeholder="Please describe any additional features, services, or notes you'd like to include..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-8">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="bg-primary hover:bg-blue-700 text-white font-semibold py-5 px-10 rounded-xl transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-200 focus:outline-none"
              >
                {submitMutation.isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    Send
                    <ArrowRight className="ml-2 h-4 w-4" />
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
