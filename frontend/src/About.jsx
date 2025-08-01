import Footer from "./Footer";
import Navbar from "./Navbar";
import { WobbleCardDemo } from "./WobbleCardDemo";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="my-2">
        <WobbleCardDemo />
      </div>
      <Footer />
    </>
  );
};

export default About;
