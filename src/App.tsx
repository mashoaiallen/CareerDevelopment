import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell, PageHeading } from './components'
import { AboutPage, HomePage, LeadershipPage, LearningPage, ProjectDetailPage, ProjectsPage, RoadmapPage, SkillsPage, WorkPage } from './pages'
import { PublicAbout, PublicLayout, PublicLearning, PublicLeadership, PublicOverview, PublicProjects, PublicRoadmap, PublicSkills, PublicWork } from './PublicPortfolio'

function NotFound() {
  return <><PageHeading eyebrow="NOT FOUND" title="This page isn’t here" description="The address may have changed, or the project record may no longer exist."/><Link to="/" className="button button-dark">Return to overview</Link></>
}

export default function App() {
  return <Routes>
    <Route path="public" element={<PublicLayout />}>
      <Route index element={<PublicOverview />} />
      <Route path="roadmap" element={<PublicRoadmap />} />
      <Route path="projects" element={<PublicProjects />} />
      <Route path="skills" element={<PublicSkills />} />
      <Route path="work" element={<PublicWork />} />
      <Route path="learning" element={<PublicLearning />} />
      <Route path="leadership" element={<PublicLeadership />} />
      <Route path="about" element={<PublicAbout />} />
    </Route>
    <Route path="admin" element={<Navigate to="/" replace />} />
    <Route element={<AppShell />}>
      <Route index element={<HomePage />} />
      <Route path="roadmap" element={<RoadmapPage />} />
      <Route path="skills" element={<SkillsPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="projects/:id" element={<ProjectDetailPage />} />
      <Route path="learning" element={<LearningPage />} />
      <Route path="leadership" element={<LeadershipPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="work" element={<WorkPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
}
