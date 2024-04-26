import React, { useState, useEffect } from 'react';
import OrganisationUnitTree from './OrganisationUnitTree';

const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dhis2Url, setDhis2Url] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [dataElements, setDataElements] = useState([]);
  const [fullDataElements, setFullDataElements] = useState([]);
  const [filteredDataElements, setFilteredDataElements] = useState([]);
  const [selectedDataElements, setSelectedDataElements] = useState([]);
  const [periodType, setPeriodType] = useState('years');
  const [addedDataElements, setAddedDataElements] = useState([]);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [organisationUnitLevels, setOrganisationUnitLevels] = useState([]);
  const [selectedOrgUnitLevel, setSelectedOrgUnitLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const [categoryCombinations, setCategoryCombinations] = useState([]);
  const [selectedCategoryCombination, setSelectedCategoryCombination] = useState('');

  useEffect(() => {
    console.log("App start...");
    if (localStorage["accessToken"] && localStorage["dhis2Url"] && localStorage["username"] && localStorage["password"]) {
      setAccessToken(localStorage["accessToken"]);
      setDhis2Url(localStorage["dhis2Url"]);
      setUsername(localStorage["username"]);
      setPassword(localStorage["password"]);
    }
    if (localStorage["dhis2Url"] && localStorage["username"]) {
      setDhis2Url(localStorage["dhis2Url"]);
      setUsername(localStorage["username"]);
    }
  }, [])

  useEffect(() => {
    const fetchOrganisationUnitLevels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${dhis2Url}/api/organisationUnitLevels?paging=false&fields=id,displayName,level`, {
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        });

        const data = await response.json();
        const sortedData = data.organisationUnitLevels.sort((a, b) => a.level - b.level);
        setOrganisationUnitLevels(sortedData);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching organisation unit levels:', error);
      }
    };

    const fetchCategoryCombinations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${dhis2Url}/api/categoryCombos?fields=id,displayName&paging=false`, {
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        });

        const data = await response.json();
        setCategoryCombinations(data.categoryCombos);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching category combinations:', error);
      }
    };

    if (accessToken) {
      fetchDataElements();
      // fetchIndicators();
      fetchOrganisationUnitLevels();
      fetchCategoryCombinations();
    }
  }, [accessToken, dhis2Url, username, password]);

  const extractDHIS2BaseURI = (uri) => {
    const regex = /^(https?:\/\/[^\/]+\/[^\/]+)/i;
    const match = uri.match(regex);
    return match ? match[1] : '';
  };

  const handleDHIS2URL = (event) => {
    setDhis2Url(extractDHIS2BaseURI(event.target.value));
  };

  const handleOrgUnitSelect = (unitId) => {
    if (selectedOrgUnits.includes(unitId)) {
      setSelectedOrgUnits(selectedOrgUnits.filter((id) => id !== unitId));
    } else {
      setSelectedOrgUnits([...selectedOrgUnits, unitId]);
    }
  };

  const handleConnect = async (event) => {
    try {
      event.preventDefault();
      const response = await fetch(`${dhis2Url}/api/me`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.id;
        setAccessToken(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        localStorage.setItem('dhis2Url', dhis2Url);
        fetchDataElements();
      } else {
        setIsLoading(true)
        console.error('Authentication failed');
      }
    } catch (error) {
      console.error('Error connecting to DHIS2:', error);
    }
  };

  const handleDisconnect = () => {
    setAccessToken('');
    setPassword('');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('password');
  };

  const fetchDataElements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${dhis2Url}/api/dataElements?fields=id,displayName,valueType,domainType&filter=domainType:eq:AGGREGATE&paging=false`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      const data = await response.json();

      const response2 = await fetch(`${dhis2Url}/api/indicators?fields=id,displayName&paging=false`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      const data2 = await response2.json();
      setDataElements([...data.dataElements, ...data2.indicators]);
      setFullDataElements([...data.dataElements, ...data2.indicators]);
      setFilteredDataElements([...data.dataElements, ...data2.indicators]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching data elements:', error);
    }
  };

  const fetchIndicators = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${dhis2Url}/api/indicators?fields=id,displayName&paging=false`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      const data = await response.json();
      setDataElements([...dataElements, ...data.indicators]);
      setFullDataElements([...dataElements, ...data.indicators]);
      setFilteredDataElements([...dataElements, ...data.indicators]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching indicators:', error);
    }
  };

  const handleDataElementFilter = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const filtered = dataElements.filter((element) =>
      element.displayName.toLowerCase().includes(searchTerm)
    );
    setFilteredDataElements(filtered);
  };

  const handleDataElementSelect = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    setSelectedDataElements(selectedOptions);
  };

  const onlyUnique = (value, index, array) => {
    return array.indexOf(value) === index;
  };

  const handleAddSelectedItems = () => {
    const newAddedDataElements = [...addedDataElements, ...selectedDataElements].filter(onlyUnique);
    setAddedDataElements(newAddedDataElements);
    setFilteredDataElements(filteredDataElements.filter(element => !selectedDataElements.includes(element.id)));
    setSelectedDataElements([]);
  };

  const handleRemoveDataElement = (elementId) => {
    const removedElement = addedDataElements.find(element => element === elementId);
    const updatedDataElements = [...filteredDataElements, { id: removedElement, displayName: fullDataElements.find(element => element.id === removedElement)?.displayName }];
    setFilteredDataElements(updatedDataElements);
    setAddedDataElements(addedDataElements.filter(element => element !== elementId));
  };

  const handlePeriodTypeChange = (event) => {
    setPeriodType(event.target.value);
    setStartYear('');
    setEndYear('');
    setStartMonth('');
    setEndMonth('');
  };

  const renderYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, index) => currentYear - index);
    return years.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ));
  };

  const renderMonthOptions = () => {
    const months = Array.from({ length: 12 }, (_, index) => {
      const month = (index + 1).toString().padStart(2, '0');
      return month;
    });
    return months.map((month) => (
      <option key={month} value={month}>
        {month}
      </option>
    ));
  };

  const handleStartYearChange = (event) => {
    setStartYear(event.target.value);
  };

  const handleEndYearChange = (event) => {
    setEndYear(event.target.value);
  };

  const handleStartMonthChange = (event) => {
    setStartMonth(event.target.value);
  };

  const handleEndMonthChange = (event) => {
    setEndMonth(event.target.value);
  };

  const handleOrgUnitLevelChange = (event) => {
    setSelectedOrgUnitLevel(event.target.value);
  };

  const handleCategoryCombinationChange = (event) => {
    setSelectedCategoryCombination(event.target.value);
  };

  const handleDownloadData = async () => {
    try {
      setIsDownloading(true);
      const dataElementDimension = addedDataElements.join(';');
      let periodDimension = '';

      if (periodType === 'years') {
        const startYearNum = parseInt(startYear);
        const endYearNum = parseInt(endYear);
        const years = [];
        for (let year = startYearNum; year <= endYearNum; year++) {
          years.push(year.toString());
        }
        periodDimension = years.join(';');
      } else if (periodType === 'months') {
        const startDate = new Date(startYear, parseInt(startMonth) - 1);
        const endDate = new Date(endYear, parseInt(endMonth) - 1);
        const months = [];
        for (let date = startDate; date <= endDate; date.setMonth(date.getMonth() + 1)) {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          months.push(`${year}-${month}`);
        }
        periodDimension = months.join(';');
      }

      const organisationUnitDimension = selectedOrgUnitLevel;

      let ouModeString = "&ouMode=CHILDREN";
      if (selectedOrgUnits.length > 0) {
        ouModeString = "&ouMode=SELECTED";
      }
      let ou = ""
      if (organisationUnitDimension) {
        ou = `LEVEL-${organisationUnitDimension}`;
      }
      if (ouModeString === "&ouMode=SELECTED") {
        ou = `${ou};${selectedOrgUnits.join(";")}`;
      }

      let categoryCombinationParam = '';
      if (selectedCategoryCombination) {
        categoryCombinationParam = `&dimension=co:${selectedCategoryCombination}`;
      }

      const url = `${dhis2Url}/api/analytics.csv?dimension=dx:${dataElementDimension}&dimension=pe:${periodDimension}&dimension=ou:${ou}${ouModeString}${categoryCombinationParam}&displayProperty=NAME&outputIdScheme=NAME`;
      console.log(url);
      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      if (response.ok) {
        const data = await response.text();
        const csvBlob = new Blob([data], { type: 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(csvBlob);
        downloadLink.download = 'dhis2_data.csv';
        downloadLink.click();
      } else {
        console.error('Error downloading data');
      }
      setIsDownloading(false);
    } catch (error) {
      setIsDownloading(false);
      console.error('Error downloading data:', error);
    }
  };

  const isDownloadDisabled =
    (periodType === 'years' && endYear < startYear) ||
    (periodType === 'months' && (endYear < startYear || (endYear === startYear && endMonth < startMonth))) ||
    addedDataElements.length === 0 ||
    (periodType === 'years' && (startYear === '' || endYear === '')) ||
    (periodType === 'months' && (startYear === '' || endYear === '' || startMonth === '' || endMonth === ''));

  const handleCloseModal = () => {
    setIsLoading(false);
    setIsDownloading(false);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {!accessToken && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full px-6 py-8 bg-gray-800 rounded shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">DHIS2 Data Downloader</h2>
            <form onSubmit={handleConnect}>
              <div>
                <input
                  type="text"
                  placeholder="DHIS2 URL"
                  value={dhis2Url}
                  onChange={(e) => setDhis2Url(e.target.value)}
                  onBlur={handleDHIS2URL}
                  className="mb-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mb-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                />
                <button type='submit'
                  // onClick={handleConnect}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {accessToken && (
        <div className="container mx-auto py-8" style={{ maxWidth: '60%' }}>
          <h1 className="text-4xl font-bold mb-4">DHIS2 Data Downloader</h1>
          <div>
            <div className="mb-4">
              <button
                onClick={handleDisconnect}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Disconnect
              </button>
            </div>
            <hr className="py-4 mb-4" />
            <div className="flex mb-4">
              <div className="w-1/2 pr-4" style={{ borderRight: "2px solid" }}>
                <h3 className="text-xl font-bold mb-2">Organisation Units</h3>
                <OrganisationUnitTree
                  dhis2Url={dhis2Url}
                  username={username}
                  password={password} onSelect={handleOrgUnitSelect}
                />
              </div>
              <div className="w-1/2 pl-4">
                <div className="mb-4">
                  <label htmlFor="orgUnitLevel" className="block mb-2 text-xl font-bold">
                    Organisation Unit Level:
                  </label>
                  <select
                    id="orgUnitLevel"
                    value={selectedOrgUnitLevel}
                    onChange={handleOrgUnitLevelChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                  >
                    <option value="">Select Level</option>
                    {organisationUnitLevels.map((level) => (
                      <option key={level.id} value={level.level}>
                        {level.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Filter data elements"
                    onChange={handleDataElementFilter}
                    className="mb-2 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                  />
                  <select
                    multiple
                    onChange={handleDataElementSelect}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
                    style={{ minHeight: "200px" }}
                  >
                    {filteredDataElements.map((element) => (
                      <option key={element.id} value={element.id}>
                        {element.displayName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddSelectedItems}
                    className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Selected Items
                  </button>
                </div>
              </div>
            </div>
            <hr className="py-4 mb-4" />
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Added Data Elements</h3>
              <ul>
                {addedDataElements.map((elementId) => (
                  <li key={elementId}>
                    {fullDataElements.find(element => element.id === elementId)?.displayName}
                    <button
                      onClick={() => handleRemoveDataElement(elementId)}
                      className="ml-2 text-red-500"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <hr className="py-4 mb-4" />
            <div className="flex items-center mb-4 w-full">
              <label htmlFor="periodType" className="mr-4">
                Period Type:
              </label>
              <select
                id="periodType"
                value={periodType}
                onChange={handlePeriodTypeChange}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            <div className="flex items-center mb-4">
              {periodType === 'months' && (
                <>
                  <div className="w-full">
                    <label htmlFor="startYear" className="mr-8">
                      Start:
                    </label>
                    <select
                      id="startYear"
                      value={startYear}
                      onChange={handleStartYearChange}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
                    >
                      <option value="">Year</option>
                      {renderYearOptions()}
                    </select>
                    <select
                      id="startMonth"
                      value={startMonth}
                      onChange={handleStartMonthChange}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
                    >
                      <option value="">Month</option>
                      {renderMonthOptions()}
                    </select>
                  </div>
                  <div className='w-full'>
                    <label htmlFor="endYear" className="mr-2">
                      End:
                    </label>
                    <select
                      id="endYear"
                      value={endYear}
                      onChange={handleEndYearChange}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
                    >
                      <option value="">Year</option>
                      {renderYearOptions()}
                    </select>
                    <select
                      id="endMonth"
                      value={endMonth}
                      onChange={handleEndMonthChange}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
                    >
                      <option value="">Month</option>
                      {renderMonthOptions()}
                    </select>
                  </div>
                </>
              )}

              {periodType === 'years' && (
                <>
                  <div className="w-5/6">
                    <label htmlFor="startYear" className="mr-8">
                      Start Year:
                    </label>
                    <select
                      id="startYear"
                      value={startYear}
                      onChange={handleStartYearChange}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
                    >
                      <option value="">Select Start Year</option>
                      {renderYearOptions()}
                    </select>
                  </div>
                  <div className='w-5/6'>
                    <label htmlFor="endYear" className="mr-2">
                      End Year:
                    </label>
                    <select
                      id="endYear"
                      value={endYear}
                      onChange={handleEndYearChange}
                      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full"
                    >
                      <option value="">Select End Year</option>
                      {renderYearOptions()}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="mb-4 w-1/2">
              <label htmlFor="categoryCombination" className="block mb-2">
                Category Combination:
              </label>
              <select
                id="categoryCombination"
                value={selectedCategoryCombination}
                onChange={handleCategoryCombinationChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded"
              >
                <option value="">Select Category Combination</option>
                {categoryCombinations.map((combo) => (
                  <option key={combo.id} value={combo.id}>
                    {combo.displayName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadData}
              disabled={isDownloadDisabled}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${isDownloadDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              Download Data
            </button>
          </div>
        </div>
      )}

      {(isLoading || isDownloading) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div style={{ minHeight: "100px", minWidth: "300px" }}>
            <div className="bg-gray-500 p-4 rounded text-black flex flex-col items-center justify-center text-center">
              <p className="mb-4">{(isLoading && accessToken.length > 0) ? 'Please wait...' : ((isLoading && accessToken.length === 0) ? 'Authentication Failed' : 'Downloading...')}</p>
              <button
                onClick={handleCloseModal}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;