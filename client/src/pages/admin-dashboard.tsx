import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, Search, Award, Eye, FileText, CheckCircle, XCircle, BarChart3, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import logoPath from "@assets/execellent-place-to-work-logo2-mePgEQXl7XTE2WQp_1760272090748.avif";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SurveyAnswers } from "@shared/schema";
import { surveyQuestions } from "@/lib/surveyQuestions";

interface Company {
  id: number;
  domain: string;
  name: string;
  hrEmail: string | null;
}

interface Employee {
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  department: string | null;
  companyId: number | null;
}

interface ResponseDetail {
  id: string;
  responseNumber: number;
  userEmail: string;
  answers: SurveyAnswers;
  completedAt: string;
  user: Employee;
}

interface Certification {
  id: number;
  companyId: number;
  certificateNumber: string;
  issuedBy: number;
  title: string;
  description: string | null;
  validFrom: string;
  validUntil: string | null;
  status: string;
  company: Company;
  issuedByAccount: {
    email: string;
  };
}

const answerLabels: Record<string, string> = {
  strongly_disagree: "Strongly Disagree",
  disagree: "Disagree",
  neutral: "Neutral",
  agree: "Agree",
  strongly_agree: "Strongly Agree"
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchResponseCode, setSearchResponseCode] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>();
  const [issueCertDialogOpen, setIssueCertDialogOpen] = useState(false);
  const [certForm, setCertForm] = useState({
    companyId: "",
    title: "",
    description: "",
    validUntil: "",
  });

  // Fetch all companies
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/admin/companies"],
  });

  // Fetch all employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/admin/employees", selectedCompanyId],
    queryFn: () => {
      const url = selectedCompanyId 
        ? `/api/admin/employees?companyId=${selectedCompanyId}`
        : "/api/admin/employees";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
  });

  // Fetch all responses
  const { data: allResponses = [] } = useQuery<ResponseDetail[]>({
    queryKey: ["/api/dashboard/responses-with-users"],
  });

  // Fetch certifications
  const { data: certifications = [] } = useQuery<Certification[]>({
    queryKey: ["/api/admin/certifications"],
  });

  // Fetch analytics data
  const { data: stats } = useQuery<{
    totalResponses: number;
    completedResponses: number;
    inProgressResponses: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: sectionAverages } = useQuery<{
    sectionA: number;
    sectionB: number;
    sectionC: number;
    sectionD: number;
    sectionE: number;
  }>({
    queryKey: ["/api/dashboard/section-averages"],
  });

  const { data: companyInsights = [] } = useQuery<Array<{
    companyDomain: string;
    companyName: string;
    totalResponses: number;
    completedResponses: number;
    averageScore: number;
  }>>({
    queryKey: ["/api/dashboard/company-insights"],
  });

  const { data: demographicBreakdown } = useQuery<{
    departments: Array<{ name: string; count: number }>;
    educationLevels: Array<{ name: string; count: number }>;
    genders: Array<{ name: string; count: number }>;
    tenures: Array<{ name: string; count: number }>;
  }>({
    queryKey: ["/api/dashboard/demographic-breakdown"],
  });

  // Chart data
  const chartColors = ['#01B8AA', '#8AD4EB', '#F2C80F', '#374649', '#FD625E'];
  
  const sectionChartData = sectionAverages ? [
    { name: 'Leadership & Vision', score: parseFloat(sectionAverages.sectionA.toFixed(2)) },
    { name: 'Employee Wellbeing', score: parseFloat(sectionAverages.sectionB.toFixed(2)) },
    { name: 'Culture & Communication', score: parseFloat(sectionAverages.sectionC.toFixed(2)) },
    { name: 'Growth & Recognition', score: parseFloat(sectionAverages.sectionD.toFixed(2)) },
    { name: 'Inclusion & Trust', score: parseFloat(sectionAverages.sectionE.toFixed(2)) },
  ] : [];

  const completionData = stats ? [
    { name: 'Completed', value: stats.completedResponses, color: '#01B8AA' },
    { name: 'In Progress', value: stats.inProgressResponses, color: '#F2C80F' },
  ] : [];

  // Search response by code
  const [searchedResponse, setSearchedResponse] = useState<ResponseDetail | null>(null);
  
  const handleSearch = async () => {
    if (!searchResponseCode.trim()) return;
    
    // Extract number from formats like "RESP-0002", "0002", "2", etc.
    const numberMatch = searchResponseCode.replace(/\D/g, '');
    if (!numberMatch) {
      setSearchedResponse(null);
      return;
    }
    
    try {
      const response = await fetch(`/api/dashboard/response/${numberMatch}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchedResponse(data);
      } else {
        setSearchedResponse(null);
        toast({
          title: "Not found",
          description: `No response found with ID: ${searchResponseCode}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchedResponse(null);
      toast({
        title: "Search failed",
        description: "Failed to search for response",
        variant: "destructive",
      });
    }
  };

  // Create certification mutation
  const createCertMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/certifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/certifications"] });
      toast({
        title: "Certification issued",
        description: "The certification has been successfully created",
      });
      setIssueCertDialogOpen(false);
      setCertForm({
        companyId: "",
        title: "",
        description: "",
        validUntil: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to issue certification",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Revoke certification mutation
  const revokeCertMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/admin/certifications/${id}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/certifications"] });
      toast({
        title: "Certification revoked",
        description: "The certification has been revoked",
      });
    },
  });

  const handleIssueCertification = () => {
    if (!certForm.companyId || !certForm.title) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createCertMutation.mutate({
      companyId: parseInt(certForm.companyId),
      title: certForm.title,
      description: certForm.description,
      validUntil: certForm.validUntil || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logoPath} alt="Logo" className="h-12" />
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-title">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Comprehensive survey analytics and management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="companies" data-testid="tab-companies">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="employees" data-testid="tab-employees">
              <Users className="w-4 h-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="responses" data-testid="tab-responses">
              <FileText className="w-4 h-4 mr-2" />
              All Responses
            </TabsTrigger>
            <TabsTrigger value="search" data-testid="tab-search">
              <Search className="w-4 h-4 mr-2" />
              Search Response
            </TabsTrigger>
            <TabsTrigger value="certifications" data-testid="tab-certifications">
              <Award className="w-4 h-4 mr-2" />
              Certifications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card data-testid="card-total-responses">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalResponses || 0}</div>
                  <p className="text-xs text-muted-foreground">All survey submissions</p>
                </CardContent>
              </Card>

              <Card data-testid="card-completed">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.completedResponses || 0}</div>
                  <p className="text-xs text-muted-foreground">Fully completed surveys</p>
                </CardContent>
              </Card>

              <Card data-testid="card-companies">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{companies.length}</div>
                  <p className="text-xs text-muted-foreground">Organizations surveyed</p>
                </CardContent>
              </Card>

              <Card data-testid="card-avg-score">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {sectionAverages 
                      ? (((sectionAverages.sectionA + sectionAverages.sectionB + 
                          sectionAverages.sectionC + sectionAverages.sectionD + 
                          sectionAverages.sectionE) / 5).toFixed(2))
                      : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Overall satisfaction</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Section Averages Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Section Performance</CardTitle>
                  <CardDescription>Average scores across all survey sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectionChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#01B8AA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Completion Status Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Completion Status</CardTitle>
                  <CardDescription>Survey completion breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Company Insights Table */}
            <Card>
              <CardHeader>
                <CardTitle>Company Performance Overview</CardTitle>
                <CardDescription>Individual company survey statistics and scores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Total Responses</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Average Score</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyInsights.map((insight, idx) => (
                      <TableRow key={idx} data-testid={`row-insight-${idx}`}>
                        <TableCell className="font-medium">{insight.companyName}</TableCell>
                        <TableCell>{insight.totalResponses}</TableCell>
                        <TableCell>{insight.completedResponses}</TableCell>
                        <TableCell>
                          <Badge variant={insight.averageScore >= 4 ? "default" : "secondary"}>
                            {insight.averageScore.toFixed(2)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {insight.averageScore >= 4 ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Excellent
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Activity className="w-3 h-3 mr-1" />
                              Good
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Demographics Chart */}
            {demographicBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Demographic Distribution</CardTitle>
                  <CardDescription>Employee demographics across all companies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-3">By Department</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={demographicBreakdown.departments} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8AD4EB" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-3">By Tenure</h4>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={demographicBreakdown.tenures} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#F2C80F" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Companies</CardTitle>
                <CardDescription>
                  View all companies participating in the survey platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Company Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>HR Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                        <TableCell>{company.id}</TableCell>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.domain}</TableCell>
                        <TableCell>{company.hrEmail || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Employees</CardTitle>
                <CardDescription>
                  View all employees who have submitted surveys
                </CardDescription>
                <div className="pt-4">
                  <Select
                    value={selectedCompanyId?.toString() || "all"}
                    onValueChange={(value) => setSelectedCompanyId(value === "all" ? undefined : parseInt(value))}
                  >
                    <SelectTrigger className="w-64" data-testid="select-company-filter">
                      <SelectValue placeholder="Filter by company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.email} data-testid={`row-employee-${employee.email}`}>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          {employee.firstName && employee.lastName
                            ? `${employee.firstName} ${employee.lastName}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{employee.company || "N/A"}</TableCell>
                        <TableCell>{employee.department || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Responses Tab */}
          <TabsContent value="responses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Survey Responses</CardTitle>
                <CardDescription>
                  View detailed survey responses from all employees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Response #</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allResponses.map((response) => (
                      <TableRow key={response.id} data-testid={`row-response-${response.responseNumber}`}>
                        <TableCell className="font-medium">#{response.responseNumber}</TableCell>
                        <TableCell>
                          {response.user.firstName && response.user.lastName
                            ? `${response.user.firstName} ${response.user.lastName}`
                            : response.userEmail}
                        </TableCell>
                        <TableCell>{response.user.company || "N/A"}</TableCell>
                        <TableCell>
                          {new Date(response.completedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" data-testid={`button-view-${response.responseNumber}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Response #{response.responseNumber} Details</DialogTitle>
                                <DialogDescription>
                                  {response.user.firstName} {response.user.lastName} ({response.userEmail})
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                {Object.entries(response.answers).map(([qNum, answer]) => {
                                  const question = surveyQuestions.find(q => q.id === parseInt(qNum));
                                  return (
                                    <div key={qNum} className="border-b pb-3">
                                      <p className="text-xs text-muted-foreground mb-1">Question {qNum} - {question?.section || 'Unknown'}</p>
                                      <p className="text-sm font-medium mb-2">{question?.text || `Question ${qNum}`}</p>
                                      <Badge variant="outline">
                                        {answerLabels[answer as string] || answer}
                                      </Badge>
                                    </div>
                                  );
                                })}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Response Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Employee Response</CardTitle>
                <CardDescription>
                  Search for a specific response using the response code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    type="text"
                    placeholder="Enter response code (e.g., RESP-0001 or 1)"
                    value={searchResponseCode}
                    onChange={(e) => setSearchResponseCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    data-testid="input-search-code"
                    autoComplete="off"
                  />
                  <Button onClick={handleSearch} data-testid="button-search">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>

                {searchedResponse && (
                  <div className="mt-6 border rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">Response #{searchedResponse.responseNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchedResponse.user.firstName} {searchedResponse.user.lastName} ({searchedResponse.userEmail})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Company: {searchedResponse.user.company} | Department: {searchedResponse.user.department}
                      </p>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(searchedResponse.answers).map(([qNum, answer]) => {
                        const question = surveyQuestions.find(q => q.id === parseInt(qNum));
                        return (
                          <div key={qNum} className="border-b pb-2">
                            <p className="text-xs text-muted-foreground mb-1">Question {qNum} - {question?.section || 'Unknown'}</p>
                            <p className="text-sm font-medium mb-2">{question?.text || `Question ${qNum}`}</p>
                            <Badge variant="outline">
                              {answerLabels[answer as string] || answer}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
                <CardDescription>
                  Issue and manage certifications for companies
                </CardDescription>
                <div className="pt-4">
                  <Dialog open={issueCertDialogOpen} onOpenChange={setIssueCertDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-issue-cert">
                        <Award className="w-4 h-4 mr-2" />
                        Issue Certification
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Issue New Certification</DialogTitle>
                        <DialogDescription>
                          Create a certification for a company based on their survey insights
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="company">Company *</Label>
                          <Select
                            value={certForm.companyId}
                            onValueChange={(value) => setCertForm({ ...certForm, companyId: value })}
                          >
                            <SelectTrigger id="company" data-testid="select-cert-company">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            value={certForm.title}
                            onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                            placeholder="e.g., Excellent Place to Work 2024"
                            data-testid="input-cert-title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={certForm.description}
                            onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                            placeholder="Optional description"
                            data-testid="input-cert-description"
                          />
                        </div>
                        <div>
                          <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                          <Input
                            id="validUntil"
                            type="date"
                            value={certForm.validUntil}
                            onChange={(e) => setCertForm({ ...certForm, validUntil: e.target.value })}
                            data-testid="input-cert-valid-until"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleIssueCertification}
                          disabled={createCertMutation.isPending}
                          data-testid="button-submit-cert"
                        >
                          {createCertMutation.isPending ? "Issuing..." : "Issue Certification"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate #</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications.map((cert) => (
                      <TableRow key={cert.id} data-testid={`row-cert-${cert.id}`}>
                        <TableCell className="font-mono text-sm">{cert.certificateNumber}</TableCell>
                        <TableCell>{cert.company.name}</TableCell>
                        <TableCell>{cert.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={cert.status === "active" ? "default" : "destructive"}
                            data-testid={`badge-status-${cert.id}`}
                          >
                            {cert.status === "active" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{cert.issuedByAccount.email}</TableCell>
                        <TableCell>
                          {cert.status === "active" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => revokeCertMutation.mutate(cert.id)}
                              disabled={revokeCertMutation.isPending}
                              data-testid={`button-revoke-${cert.id}`}
                            >
                              Revoke
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
