// App.js

import "./App.css";
import { createContext, useEffect, useState, useContext } from "react";
import {
  getSections,
  makeTopicsMap,
  loadYearData,
  getYears,
  getSampleData,
  getFullReportLink
} from "./services/googleSheetsService";
import Header from "./components/Header";

import Expander from "./components/Expander";
import bg1 from "./assets/bg1.svg";
import bg2 from "./assets/bg2.svg";
import loader from "./assets/loader.gif";
import { ButtonGroup1, ButtonGroup2 } from "./components/shared/ButtonGroup";
import { LinkComponent } from './components/shared/LinkComponent';
import { DataProvider} from "./contexts/dataContext";
import { LanguageProvider, useLanguage } from './contexts/langContext';
import Section from "./components/Section";
import { useYear, YearProvider } from "./contexts/yearContext";

export const DataContext = createContext([]);

function AppContent() {
  const CONFIG_SHEET_ID = process.env.REACT_APP_CONFIG_SPREADSHEET_ID

  const [years,setYears] = useState([]);
  const { language, setLanguage } = useLanguage();
  const { year, setYear } = useYear(); // report year

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportLink, setReportLink] = useState('');

  const [topic, setTopic] = useState('')

  const [yearData, setYearData] = useState({});

  const [sections, setSections] = useState([]);
  const [descriptions, setDescriptions] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [sampleData, setSampleData] = useState([])

  const [topicsMap, setTopicsMap] = useState({});

    useEffect(() => {
      const fetchYears = async () => {

        getYears().then(res => {
          setYears(res)
        }).catch(error => {
          console.error('Error fetching years:', error);
        });
        
      };
      fetchYears();
    }, []);  
  
  useEffect(() => {
    makeTopicsMap().then(map => {
      setTopicsMap(map);
      setLoading(false);
    }).catch(err => {
      setError(err);
      setLoading(false);
    });
  }, []);

  //Get sample data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getSampleData(year, language);
        setSampleData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  
  useEffect(() => {
    let isMounted = true;  // Flag to track the mounted status
  
    const updateLink = async () => {
      setLoading(true);
      try {
        const link = await getFullReportLink(year, language);
  
        if (isMounted) {  // Check if the component is still mounted
          if (link) {
            setReportLink(link); 
          } else {
            setReportLink('123'); 
          }
        }
      } catch (error) {
        console.error('Error updating report link:', error);
        if (isMounted) {  // Check if the component is still mounted
          setReportLink('errored'); // Reset the link in case of an error
        }
      } finally {
        if (isMounted) {  // Check if the component is still mounted
          setLoading(false);
        }
      }
    };
  
    updateLink();
  
    return () => {
      isMounted = false;  // Set the flag to false when the component unmounts
    };
  }, [year, language]);
  
  

  // Get selected year
  const selectYear = (event) => {
    setYear(event.target.name);
  };

  // Load year data 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await loadYearData(year);
        setYearData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const fetchData = async () => {
      try {
        const sectionsData = await getSections(language);

        if (isMounted) {
          setSections(sectionsData);
          if (!topic) {
            setTopic(sectionsData[0]);
          }

        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [language]);


  const changeLanguage = (lang) => {
    setLanguage(lang);
  };
  const selectTopic = (event) => {
    setTopic(event.target.name);
  };


  const toggleExpander = () => {
    setIsExpanded(!isExpanded);
  };


  if (loading) {
    return (
      <div className="loader">
        <img src={loader} alt="loading" />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!sampleData) {
    return <div>Loading sample data...</div>;
  }

  //Check in topicsMap has undefined values
  const isTopicsMapPopulated = Object.keys(topicsMap).length > 0 &&
    Object.values(topicsMap).every(value => value !== undefined);
  //Check if all necessary data is loaded
  // const isDataReady = sections.length > 0 && years.length > 0  && isTopicsMapPopulated; 



  const topicComponent = () => {
    return (
      <>
        {isTopicsMapPopulated ? (
          <Section topic={topic} topicsMap={topicsMap} />
        ) : (
          <div>APP/Loading  topicsMap...</div>
        )}
      </>
    );
  };

  if (sections && years ) {
    return (
      <div className="App">

        <Header />
        <ButtonGroup2
          buttons={years || ["2022"]}
          onButtonClick={selectYear}
        />

        <LinkComponent
          href={reportLink}
          label={language === 'ru' ? `Полная версия отчета за ${year} год` : `Full report for ${year}`}
          color="grey"
        />
{/* <h1>{reportLink}</h1> */}
        <h1>
          {language === 'ru'
            ? `Положение ЛГБТК+ людей в россии на ${year} год`
            : `LGBTQ+ people's situation in Russia in ${year}`}
        </h1>

        <ButtonGroup1
          buttons={sections}
          onButtonClick={selectTopic}
        />

     
         <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Expander year={year} data={sampleData}  language={language}/>
        </div>
      
        <div className="topic-component">{topicComponent()}</div>
        {/* <DataContext.Provider value={{ data, conclusions }}> */}
        <img src={bg1} alt="" className="background-image-1"></img>
        <img src={bg2} alt="" className="background-image-2"></img>
        {/* </DataContext.Provider> */}


      </div>

    );
  } else {
    return (
      <div className="App">
        <Header />

        <h1>
          {language === 'ru'
            ? `Положение ЛГБТК+ людей в россии в ${year} году`
            : `LGBTK+ people's situation in Russia in ${year}`}
        </h1>

        <img src={loader} alt=""></img>
        <img src={bg1} alt="" className="background-image-1"></img>
        <img src={bg2} alt="" className="background-image-2"></img>
      </div>
    );
  }
}


function App() {
  console.log('App start');

  return (
    <LanguageProvider>
      <YearProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </YearProvider>
    </LanguageProvider>
  );
}


export default App;
