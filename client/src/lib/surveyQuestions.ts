export interface SurveyQuestion {
  id: number;
  text: string;
  section: string;
  sectionLetter: string;
}

export const surveyQuestions: SurveyQuestion[] = [
  // Section A: Leadership & Vision (10 questions)
  { id: 1, text: "Leaders communicate a clear vision for the organization's future.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 2, text: "I trust the leadership team to make the right decisions for the organization.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 3, text: "Leaders are approachable and genuinely listen to employees' ideas or concerns.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 4, text: "The organization's values are consistently demonstrated by its leaders.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 5, text: "I understand how my work contributes to the company's overall goals.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 6, text: "Leadership shows appreciation for employees' efforts.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 7, text: "Management keeps employees informed about important decisions and changes.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 8, text: "Leaders act with honesty and integrity.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 9, text: "Employees are encouraged to participate in decision-making processes.", section: "Leadership & Vision", sectionLetter: "A" },
  { id: 10, text: "I feel confident in the direction our organization is headed.", section: "Leadership & Vision", sectionLetter: "A" },
  
  // Section B: Employee Wellbeing & Happiness (10 questions)
  { id: 11, text: "My work environment supports a healthy work-life balance.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 12, text: "I am satisfied with the physical and mental wellness initiatives offered.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 13, text: "My workload is manageable and reasonable.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 14, text: "I feel comfortable taking time off when I need to.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 15, text: "The organization cares about my personal wellbeing.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 16, text: "I have access to the tools and resources I need to do my job well.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 17, text: "I feel safe (physically and psychologically) in my workplace.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 18, text: "Stress is effectively managed within my team or department.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 19, text: "I am encouraged to maintain a healthy lifestyle.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  { id: 20, text: "I feel motivated and energized at work.", section: "Employee Wellbeing & Happiness", sectionLetter: "B" },
  
  // Section C: Culture & Communication (10 questions)
  { id: 21, text: "Communication between teams is open and transparent.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 22, text: "Employees are encouraged to share ideas freely.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 23, text: "There is a strong sense of teamwork and collaboration.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 24, text: "Information flows freely across all levels of the organization.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 25, text: "The organization celebrates milestones and successes effectively.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 26, text: "Our culture promotes innovation and creativity.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 27, text: "Constructive feedback is encouraged and valued.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 28, text: "I feel respected by my colleagues.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 29, text: "The organization lives up to its stated mission and values.", section: "Culture & Communication", sectionLetter: "C" },
  { id: 30, text: "I am proud of the organization's culture.", section: "Culture & Communication", sectionLetter: "C" },
  
  // Section D: Growth & Recognition (10 questions)
  { id: 31, text: "My contributions are recognized and appreciated by management.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 32, text: "I receive feedback that helps me improve my performance.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 33, text: "I have good opportunities for professional development.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 34, text: "Promotions and career growth are based on merit.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 35, text: "I receive adequate training to perform my job effectively.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 36, text: "My achievements are acknowledged regularly.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 37, text: "I am encouraged to take on new challenges and responsibilities.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 38, text: "The organization invests in employee growth and skill-building.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 39, text: "My career goals are supported by my manager.", section: "Growth & Recognition", sectionLetter: "D" },
  { id: 40, text: "I see a future for myself in this organization.", section: "Growth & Recognition", sectionLetter: "D" },
  
  // Section E: Inclusion, Diversity & Trust (10 questions)
  { id: 41, text: "Everyone is treated fairly regardless of gender, age, background, or position.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 42, text: "The workplace is inclusive and respectful to all individuals.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 43, text: "I feel accepted and valued for who I am.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 44, text: "The organization takes active steps to promote diversity.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 45, text: "Discrimination and bias are not tolerated here.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 46, text: "I trust my coworkers to act ethically and responsibly.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 47, text: "People cooperate and support one another across departments.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 48, text: "Conflicts are handled fairly and constructively.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 49, text: "I feel safe to express my opinions without fear of retaliation.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
  { id: 50, text: "I believe this is truly an Excellent Place to Work.", section: "Inclusion, Diversity & Trust", sectionLetter: "E" },
];

export const sections = [
  { letter: "A", name: "Leadership & Vision", questions: 10 },
  { letter: "B", name: "Employee Wellbeing & Happiness", questions: 10 },
  { letter: "C", name: "Culture & Communication", questions: 10 },
  { letter: "D", name: "Growth & Recognition", questions: 10 },
  { letter: "E", name: "Inclusion, Diversity & Trust", questions: 10 },
];
