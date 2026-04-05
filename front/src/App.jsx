import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Membership from "./pages/Membership";
import Header from "./components/Header";
import Footer from "./components/Footer";
import OurStory from "./pages/Ourstory";
import BODPage from "./pages/Bod";
import Committee from "./pages/Committee";
import Bylaws from "./pages/Bylaws";
import Contact from "./pages/Contact";
import CovSphere from "./pages/Covsphere";
import Privacy from "./pages/privacy";
import Refund from "./pages/Refund";
import Terms from "./pages/Terms";
import Registration from "./pages/Registration";
import PersonalDetails from "./pages/reg1";
import EducationalDetails from "./pages/reg2";
import WorkExperience from "./pages/reg3";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";


function App(){
  return(
    <>
    <Header/>

    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/membership" element={<Membership/>} />
      <Route path="/our-story" element={<OurStory/>} />
      <Route path="/bod" element={<BODPage/>} />
      <Route path="/committee" element={<Committee/>} />
      <Route path="/bylaws" element={<Bylaws/>} />
      <Route path="/contact" element={<Contact/>} />
      <Route path="/covsphere" element={<CovSphere/>} />
      <Route path="/privacy" element={<Privacy/>} />
      <Route path="/refund" element={<Refund/>} />
      <Route path="/terms" element={<Terms/>} />
      <Route path="/register" element={<Registration/>} />
      <Route path="/personal" element={<PersonalDetails/>} />
      <Route path="/education" element={<EducationalDetails/>} />
      <Route path="/work" element={<WorkExperience/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
    </Routes>

    <Footer/>
    </>
  );
}

export default App;