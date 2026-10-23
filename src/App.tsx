import { Link, Route, Routes } from 'react-router-dom'
import { AppShell, PageHeading } from './components'
import { AboutPage, HomePage, LeadershipPage, LearningPage, ProjectDetailPage, ProjectsPage, RoadmapPage, SkillsPage, WorkPage } from './pages'
import WelcomePage from './WelcomePage'

function NotFound() {
  return <><PageHeading eyebrow="NOT FOUND" title="This page isn’t here" description="The address may have changed, or the project record may no longer exist."/><Link to="/home" className="button button-dark">Return to portfolio</Link></>
}

export default function App() {
  return <Routes><Route index element={<WelcomePage/>}/><Route element={<AppShell/>}><Route path="home" element={<HomePage/>}/><Route path="roadmap" element={<RoadmapPage/>}/><Route path="skills" element={<SkillsPage/>}/><Route path="projects" element={<ProjectsPage/>}/><Route path="projects/:id" element={<ProjectDetailPage/>}/><Route path="learning" element={<LearningPage/>}/><Route path="leadership" element={<LeadershipPage/>}/><Route path="about" element={<AboutPage/>}/><Route path="work" element={<WorkPage/>}/><Route path="*" element={<NotFound/>}/></Route></Routes>
}
