import React from "react";
import Form from "./Form";
import SeraUIHero from "./SeraUIHero";
import Footer from "./Footer";
import { MeteorsDemo } from "./MeteorsDemo";
import { WobbleCardDemo } from "./WobbleCardDemo";

const App = () => {
  return (
    <>
      <SeraUIHero />
      <WobbleCardDemo />
      {/* <div className='flex justify-center'>
        <MeteorsDemo />

        </div> */}
  
      <Footer />
    </>
  );
};

export default App;
