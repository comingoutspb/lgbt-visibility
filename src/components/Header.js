

import React, {useState, useEffect} from "react"; 
import logoRU from "./../assets/logoRU.svg";  
import logoEN from "./../assets/logoEN.svg";  
 
import {ButtonGroupLang} from "./shared/ButtonGroup"; 
import { useLanguage } from '../contexts/langContext'; 
import { getBannerData } from "../services/googleSheetsService"; 
 
 
export default function Header() { 
  const {language, setLanguage} = useLanguage();  
  const logo = language === 'ru' ? logoRU : logoEN; 
   
  const Banner = ({ year, link }) => { 
    if (!banner || banner.status !== 'on') { 
      return null; // Don't display if no active config 
    } 
   
    return ( 
      <a href={link} target="_blank" rel="noopener noreferrer" className="banner">
        <div>
      
          {language === 'ru'
            ? `Участвовать  в исследовании ${year} года`
            : `  Participate in the ${year} survey`}
      
          </div>
      </a>
    ); 
  }; 
   
    const [banner, setBanner] = useState(null); 
   
    useEffect(() => { 
      getBannerData().then((res) => setBanner(res)); 
    }, []); 
   
    
   
   
  const changeLanguage = (event) => { 
    setLanguage(event.target.name); 
  }; 
 
  return ( 
    <header className="header"> 
      <div className="App-header-logo"> 
        <img src={logo} alt="Logo" /> 
      </div> 
      <div className="banner-header"> 
        <Banner year={banner?.year} link={banner?.link} /> 
      </div> 
      <div className="buttin-group-header"> 
        <div 
          className="header-buttons-container" 
          style={{ marginLeft: "20px" }} 
        > 
          {language !== "en" && (
            <a 
              href="https://comingoutspb.com/we-are-helping/" 
              className="button-secondary" 
              target="_blank" 
              rel="noopener noreferrer"
            > 
              {language === "ru" ? "Нужна помощь" : "Need Help"}
            </a>
          )}

          <a 
            href="https://comingoutspb.org/support/" 
            className="button-primary" 
            target="_blank" 
            rel="noopener noreferrer" 
          > 
            {language === "ru" ? "Хочу помочь" : "Donate"} 
          </a> 
        </div> 
 
        <ButtonGroupLang 
          buttons={["ru", "en"]} 
          onButtonClick={changeLanguage} 
        /> 
      </div> 
    </header> 
  ); 
}