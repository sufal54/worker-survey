import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Users, CheckCircle, Clock, Building2, Search, TrendingUp, Eye, Activity, Filter, Heart, Star, Smile, Award } from "lucide-react";
import logoPath from "@assets/execellent-place-to-work-logo2-mePgEQXl7XTE2WQp_1760272090748.avif";
import { surveyQuestions, sections } from "@/lib/surveyQuestions";
import { GaugeChart } from "@/components/ui/gauge-chart";
import { DEPARTMENTS, EDUCATION_LEVELS, GENDERS, WORKING_TENURES } from "@shared/schema";
import type { SurveyAnswers } from "@shared/schema";

// Power BI-inspired color palette (professional blues and teals)
const POWER_BI_COLORS = {
  primary: '#01B8AA',      // Teal (positive/success)
  secondary: '#374649',    // Dark gray
  accent: '#FD625E',       // Coral (negative/alert)
  warning: '#F2C80F',      // Gold (warning)
  neutral: '#5F6B6D',      // Medium gray
  info: '#8AD4EB',         // Light blue
};

const CHART_COLORS = [
  POWER_BI_COLORS.primary,
  POWER_BI_COLORS.info,
  POWER_BI_COLORS.warning,
  POWER_BI_COLORS.secondary,
  POWER_BI_COLORS.accent,
];

const answerLabels: Record<string, string> = {
  strongly_disagree: "Strongly Disagree",
  disagree: "Disagree",
  neutral: "Neutral",
  agree: "Agree",
  strongly_agree: "Strongly Agree"
};

const answerColors: Record<string, string> = {
  strongly_disagree: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
  disagree: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
  neutral: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  agree: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
  strongly_agree: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
};

interface CompanyInsight {
  companyDomain: string;
  companyName: string;
  totalResponses: number;
  completedResponses: number;
  averageScore: number;
}

interface DemographicItem {
  name: string;
  count: number;
}

interface DemographicBreakdown {
  departments: DemographicItem[];
  educationLevels: DemographicItem[];
  genders: DemographicItem[];
  tenures: DemographicItem[];
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  
  // Filters for well-being metrics
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterEducation, setFilterEducation] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterTenure, setFilterTenure] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");

  // Fetch current HR account to check role
  const { data: hrAccount, isLoading: isLoadingAccount } = useQuery({
    queryKey: ["/api/hr/me"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: sectionAverages } = useQuery({
    queryKey: ["/api/dashboard/section-averages"],
  });

  const { data: companyInsights } = useQuery<CompanyInsight[]>({
    queryKey: ["/api/dashboard/company-insights"],
  });

  // Admin-only: Individual responses with detailed answers (HR should NOT see this)
  const { data: responsesWithUsers } = useQuery({
    queryKey: ["/api/dashboard/responses-with-users"],
    enabled: !isLoadingAccount && (hrAccount as any)?.role === "admin",
  });

  // Build filter query params
  const filterParams = new URLSearchParams();
  if (filterDepartment && filterDepartment !== "all") filterParams.append("department", filterDepartment);
  if (filterEducation && filterEducation !== "all") filterParams.append("educationLevel", filterEducation);
  if (filterGender && filterGender !== "all") filterParams.append("gender", filterGender);
  if (filterTenure && filterTenure !== "all") filterParams.append("workingTenure", filterTenure);
  if (filterCompany && filterCompany !== "all") filterParams.append("companyDomain", filterCompany);
  const filterQuery = filterParams.toString();

  const { data: wellbeingMetrics } = useQuery({
    queryKey: ["/api/dashboard/wellbeing-metrics", filterQuery],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/wellbeing-metrics${filterQuery ? `?${filterQuery}` : ''}`);
      if (!response.ok) throw new Error("Failed to fetch wellbeing metrics");
      return response.json();
    },
  });

  const { data: demographicBreakdown } = useQuery<DemographicBreakdown>({
    queryKey: ["/api/dashboard/demographic-breakdown"],
  });

  // Admin-only: Fetch HR accounts list
  const { data: hrAccounts } = useQuery({
    queryKey: ["/api/dashboard/hr-accounts"],
    enabled: !isLoadingAccount && (hrAccount as any)?.role === "admin",
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // Extract number from formats like "RESP-0002", "0002", "2", etc.
    const numberMatch = searchQuery.replace(/\D/g, '');
    if (!numberMatch) return;
    
    const responseNumber = parseInt(numberMatch);
    
    try {
      const response = await fetch(`/api/dashboard/response/${responseNumber}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedResponse(data);
      } else {
        setSelectedResponse(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSelectedResponse(null);
    }
  };

  const chartData = sectionAverages ? [
    { name: 'Leadership & Vision', score: parseFloat((sectionAverages as any).sectionA.toFixed(2)) },
    { name: 'Employee Wellbeing', score: parseFloat((sectionAverages as any).sectionB.toFixed(2)) },
    { name: 'Communication', score: parseFloat((sectionAverages as any).sectionC.toFixed(2)) },
    { name: 'Values & Recognition', score: parseFloat((sectionAverages as any).sectionD.toFixed(2)) },
    { name: 'Inclusion & Trust', score: parseFloat((sectionAverages as any).sectionE.toFixed(2)) },
  ] : [];

  const completionData = stats ? [
    { name: 'Completed', value: (stats as any).completedResponses },
    { name: 'In Progress', value: (stats as any).inProgressResponses },
  ] : [];

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#1E1E1E]">
      {/* Power BI-style Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#252525] shadow-sm">
        <div className="container flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <img 
              src={logoPath} 
              alt="Excellent Place to Work" 
              className="h-8 w-auto object-contain"
              data-testid="img-logo"
            />
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Survey Analytics Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container px-6 py-6">
        {/* Power BI-style KPI Cards (Top Priority - Z-Pattern) */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="bg-white dark:bg-[#252525] border-none shadow-sm hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Responses</p>
                <div className="w-10 h-10 rounded-sm bg-[#01B8AA]/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#01B8AA]" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-responses">
                  {(stats as any)?.totalResponses || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Survey participants</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252525] border-none shadow-sm hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completed</p>
                <div className="w-10 h-10 rounded-sm bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="stat-completed">
                  {(stats as any)?.completedResponses || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Fully submitted</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252525] border-none shadow-sm hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">In Progress</p>
                <div className="w-10 h-10 rounded-sm bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="stat-in-progress">
                  {(stats as any)?.inProgressResponses || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pending completion</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#252525] border-none shadow-sm hover-elevate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Companies</p>
                <div className="w-10 h-10 rounded-sm bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="stat-companies">
                  {Array.isArray(companyInsights) ? companyInsights.length : 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Participating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Well-being Index Metrics - with Gauge Charts */}
        <Card className="mb-6 bg-white dark:bg-[#252525] border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-[#01B8AA]" />
              <CardTitle className="text-base font-semibold">Employee Well-being Index</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Real-time well-being metrics based on survey responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Controls */}
            <div className="p-4 bg-gray-50 dark:bg-[#1E1E1E] rounded-sm space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Metrics by Demographics</p>
              </div>
              <div className="grid gap-3 md:grid-cols-5">
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger data-testid="select-filter-department" className="bg-white dark:bg-[#252525]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterEducation} onValueChange={setFilterEducation}>
                  <SelectTrigger data-testid="select-filter-education" className="bg-white dark:bg-[#252525]">
                    <SelectValue placeholder="All Education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Education</SelectItem>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterGender} onValueChange={setFilterGender}>
                  <SelectTrigger data-testid="select-filter-gender" className="bg-white dark:bg-[#252525]">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterTenure} onValueChange={setFilterTenure}>
                  <SelectTrigger data-testid="select-filter-tenure" className="bg-white dark:bg-[#252525]">
                    <SelectValue placeholder="All Tenures" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tenures</SelectItem>
                    {WORKING_TENURES.map((tenure) => (
                      <SelectItem key={tenure} value={tenure}>
                        {tenure}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger data-testid="select-filter-company" className="bg-white dark:bg-[#252525]">
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companyInsights && Array.isArray(companyInsights) && companyInsights.map((company) => (
                      <SelectItem key={company.companyDomain} value={company.companyDomain}>
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(filterDepartment !== "all" || filterEducation !== "all" || filterGender !== "all" || filterTenure !== "all" || filterCompany !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setFilterDepartment("all");
                    setFilterEducation("all");
                    setFilterGender("all");
                    setFilterTenure("all");
                    setFilterCompany("all");
                  }}
                  data-testid="button-clear-filters"
                  className="text-xs"
                >
                  Clear All Filters
                </Button>
              )}
            </div>

            {/* Gauge Charts */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="bg-gradient-to-br from-[#01B8AA]/5 to-[#01B8AA]/10 border-[#01B8AA]/20">
                <CardContent className="p-6">
                  <GaugeChart
                    value={wellbeingMetrics?.successScore || 0}
                    title="Success Score"
                    color="#01B8AA"
                    data-testid="gauge-success"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Leadership & Growth
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/20">
                <CardContent className="p-6">
                  <GaugeChart
                    value={wellbeingMetrics?.prideIndex || 0}
                    title="Pride Index"
                    color="#9333ea"
                    data-testid="gauge-pride"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Culture & Inclusion
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
                <CardContent className="p-6">
                  <GaugeChart
                    value={wellbeingMetrics?.happinessLevel || 0}
                    title="Happiness Level"
                    color="#f59e0b"
                    data-testid="gauge-happiness"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Employee Wellbeing
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <GaugeChart
                    value={wellbeingMetrics?.overallSatisfaction || 0}
                    title="Overall Satisfaction"
                    color="#22c55e"
                    data-testid="gauge-overall"
                  />
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Work Satisfaction
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Search Card - Power BI Style (Admin Only) */}
        {(hrAccount as any)?.role === "admin" && (
          <Card className="mb-6 bg-white dark:bg-[#252525] border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gray-500" />
                <CardTitle className="text-base font-semibold">Search Response by ID</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Enter a response ID (e.g., RESP-0001 or 1) to view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter Response ID (e.g., RESP-0001)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-50 dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-700"
                data-testid="input-search-response"
                autoComplete="off"
              />
              <Button onClick={handleSearch} className="bg-[#01B8AA] hover:bg-[#019B8E] text-white" data-testid="button-search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            {selectedResponse && (
              <div className="space-y-4 pt-2">
                <Card className="border border-[#01B8AA]/30 bg-[#01B8AA]/5 dark:bg-[#01B8AA]/10">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">Response Details</h3>
                        <Badge variant="secondary" className="font-mono bg-[#01B8AA]/20 text-[#01B8AA] dark:text-[#01B8AA]" data-testid="badge-response-id">
                          RESP-{String(selectedResponse.responseNumber).padStart(4, '0')}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Employee Email</p>
                          <p className="font-medium text-sm" data-testid="text-employee-email">{selectedResponse.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Company</p>
                          <p className="font-medium text-sm" data-testid="text-company">{selectedResponse.companyDomain}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Name</p>
                          <p className="font-medium text-sm">
                            {selectedResponse.user?.firstName} {selectedResponse.user?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submitted At</p>
                          <p className="font-medium text-sm">
                            {selectedResponse.completedAt 
                              ? new Date(selectedResponse.completedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'In Progress'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Status</p>
                        <Badge variant={selectedResponse.isComplete ? "default" : "secondary"} className="bg-green-500 hover:bg-green-600">
                          {selectedResponse.isComplete ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Answers Section */}
                <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-gray-500" />
                      <CardTitle className="text-base font-semibold">Complete Survey Responses (All 50 Questions)</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Detailed investigation of each answer provided by the employee
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {sections.map((section) => {
                      const sectionQuestions = surveyQuestions.filter(q => q.sectionLetter === section.letter);
                      return (
                        <div key={section.letter} className="space-y-3">
                          <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                              Section {section.letter}: {section.name}
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {sectionQuestions.map((question) => {
                              const answer = (selectedResponse.answers as SurveyAnswers)?.[question.id.toString()];
                              return (
                                <div key={question.id} className="p-3 rounded-sm bg-gray-50 dark:bg-[#1E1E1E] hover-elevate" data-testid={`answer-${question.id}`}>
                                  <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-sm bg-[#01B8AA]/10 text-[#01B8AA] font-semibold text-xs">
                                      {question.id}
                                    </span>
                                    <div className="flex-1 space-y-2">
                                      <p className="text-sm text-gray-700 dark:text-gray-300">{question.text}</p>
                                      {answer ? (
                                        <Badge className={`${answerColors[answer]} text-xs`}>
                                          {answerLabels[answer]}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-xs">No Answer</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            )}
            
              {searchQuery && !selectedResponse && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No response found with ID: {searchQuery}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Power BI-style Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white dark:bg-[#252525] border-none shadow-sm p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#01B8AA] data-[state=active]:text-white" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="demographics" className="data-[state=active]:bg-[#01B8AA] data-[state=active]:text-white" data-testid="tab-demographics">
              Demographics
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-[#01B8AA] data-[state=active]:text-white" data-testid="tab-companies">
              Company Insights
            </TabsTrigger>
            {(hrAccount as any)?.role === "admin" && (
              <TabsTrigger value="responses" className="data-[state=active]:bg-[#01B8AA] data-[state=active]:text-white" data-testid="tab-responses">
                All Responses
              </TabsTrigger>
            )}
            {(hrAccount as any)?.role === "admin" && (
              <TabsTrigger value="hr-accounts" className="data-[state=active]:bg-[#01B8AA] data-[state=active]:text-white" data-testid="tab-hr-accounts">
                HR Accounts
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Section Scores Chart - Power BI Style */}
              <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#01B8AA]" />
                    Section Average Scores
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Average ratings across all survey sections (1-5 scale)
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                      />
                      <YAxis 
                        domain={[0, 5]} 
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar dataKey="score" fill={POWER_BI_COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Completion Status - Power BI Style */}
              <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#01B8AA]" />
                    Survey Completion Status
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribution of completed vs in-progress surveys
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E5E7EB',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6">
            <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#01B8AA]" />
                  <CardTitle className="text-base font-semibold">Participant Demographics Breakdown</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Distribution of survey participants across demographic segments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Department Breakdown */}
                  <Card className="bg-gray-50 dark:bg-[#1E1E1E] border-none">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">By Department</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart 
                          data={demographicBreakdown?.departments || []} 
                          layout="horizontal"
                          margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100}
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="count" fill={POWER_BI_COLORS.primary} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Education Level Breakdown */}
                  <Card className="bg-gray-50 dark:bg-[#1E1E1E] border-none">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">By Education Level</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart 
                          data={demographicBreakdown?.educationLevels || []}
                          layout="horizontal"
                          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120}
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="count" fill={POWER_BI_COLORS.info} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Gender Breakdown */}
                  <Card className="bg-gray-50 dark:bg-[#1E1E1E] border-none">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">By Gender</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={demographicBreakdown?.genders || []}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {(demographicBreakdown?.genders || []).map((entry: DemographicItem, index: number) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Working Tenure Breakdown */}
                  <Card className="bg-gray-50 dark:bg-[#1E1E1E] border-none">
                    <CardContent className="p-6">
                      <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">By Working Tenure</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart 
                          data={demographicBreakdown?.tenures || []}
                          layout="horizontal"
                          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120}
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #E5E7EB',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar dataKey="count" fill={POWER_BI_COLORS.warning} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-[#01B8AA]/5 border-[#01B8AA]/20">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-sm bg-[#01B8AA]/20 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-[#01B8AA]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                          Demographic Insights
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Use the demographic filters in the Well-being Index section above to analyze well-being metrics for specific employee segments. This helps identify stress points, engagement levels, and improvement areas across different teams and demographics.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#01B8AA]" />
                  <CardTitle className="text-base font-semibold">Company Insights</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Survey participation and performance by company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyInsights && (companyInsights as any).length > 0 ? (
                    (companyInsights as any).map((company: any) => (
                      <Card key={company.companyDomain} className="bg-gray-50 dark:bg-[#1E1E1E] border-none">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-sm capitalize" data-testid={`company-name-${company.companyDomain}`}>
                                {company.companyName}
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{company.companyDomain}</p>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs border-[#01B8AA]/30 text-[#01B8AA]">
                              {company.totalResponses} {company.totalResponses === 1 ? 'response' : 'responses'}
                            </Badge>
                          </div>
                          
                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white" data-testid={`company-completed-${company.companyDomain}`}>
                                {company.completedResponses}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average Score</p>
                              <div className="flex items-baseline gap-1">
                                <p className="text-lg font-bold text-[#01B8AA]" data-testid={`company-score-${company.companyDomain}`}>
                                  {company.averageScore.toFixed(2)}
                                </p>
                                <span className="text-xs text-gray-400">/ 5.0</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completion Rate</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {company.totalResponses > 0 
                                  ? Math.round((company.completedResponses / company.totalResponses) * 100)
                                  : 0}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                      No company data available yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responses" className="space-y-6">
            <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">All Survey Responses</CardTitle>
                <CardDescription className="text-xs">
                  Complete list of submitted surveys with employee details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Response ID</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Employee</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Company</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Submitted At</th>
                        <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responsesWithUsers && (responsesWithUsers as any).length > 0 ? (
                        (responsesWithUsers as any).map((response: any) => (
                          <tr key={response.id} className="border-b border-gray-100 dark:border-gray-800 hover-elevate" data-testid={`response-row-${response.responseNumber}`}>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="font-mono text-xs bg-[#01B8AA]/20 text-[#01B8AA] dark:text-[#01B8AA]">
                                RESP-{String(response.responseNumber).padStart(4, '0')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{response.user?.firstName} {response.user?.lastName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{response.userEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-sm capitalize text-gray-900 dark:text-white">{response.companyDomain?.split('.')[0] || 'N/A'}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{response.companyDomain}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                              {response.completedAt 
                                ? new Date(response.completedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={response.isComplete ? "default" : "secondary"} className={response.isComplete ? "bg-green-500 hover:bg-green-600 text-white" : ""}>
                                {response.isComplete ? 'Completed' : 'In Progress'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No survey responses yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HR Accounts Tab (Admin Only) */}
          {(hrAccount as any)?.role === "admin" && (
            <TabsContent value="hr-accounts" className="space-y-6">
              <Card className="bg-white dark:bg-[#252525] border-none shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">HR Accounts & User Management</CardTitle>
                  <CardDescription className="text-xs">
                    All HR accounts across all companies with access details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase bg-gray-50 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left font-semibold">Email</th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold">Company</th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold">Role</th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold">Last Login</th>
                          <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hrAccounts && (hrAccounts as any).length > 0 ? (
                          (hrAccounts as any).map((account: any) => (
                            <tr key={account.id} className="border-b border-gray-100 dark:border-gray-800 hover-elevate" data-testid={`hr-account-${account.id}`}>
                              <td className="px-4 py-3">
                                <p className="font-medium text-sm text-gray-900 dark:text-white">{account.email}</p>
                              </td>
                              <td className="px-4 py-3">
                                <div>
                                  <p className="font-medium text-sm capitalize text-gray-900 dark:text-white">{account.company?.name || 'N/A'}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{account.company?.domain || 'N/A'}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge 
                                  variant={account.role === 'admin' ? "default" : "secondary"} 
                                  className={account.role === 'admin' ? "bg-[#01B8AA] hover:bg-[#01B8AA]/90 text-white" : ""}
                                >
                                  {account.role === 'admin' ? 'Admin' : 'HR'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                {account.lastLogin 
                                  ? new Date(account.lastLogin).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'Never'}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={account.mustResetPassword ? "destructive" : "outline"} className="text-xs">
                                  {account.mustResetPassword ? 'Password Reset Required' : 'Active'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                              No HR accounts found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
