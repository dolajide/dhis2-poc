import React, { useState, useEffect } from 'react';

const OrganisationUnitTree = ({ dhis2Url, username, password, onSelect }) => {
  const [orgUnits, setOrgUnits] = useState([]);
  const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
  const [expandedOrgUnits, setExpandedOrgUnits] = useState([]);

  useEffect(() => {
    const fetchRootOrgUnits = async () => {
      try {
        const response = await fetch(`${dhis2Url}/api/organisationUnits?level=1&fields=id,displayName,children[id,displayName],level`, {
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
          },
        });
        const data = await response.json();
        setOrgUnits(data.organisationUnits);
      } catch (error) {
        console.error('Error fetching root organisation units:', error);
      }
    };
    fetchRootOrgUnits();
  }, [dhis2Url, username, password]);

  const fetchChildOrgUnits = async (parentId, parentPath) => {
    try {
      const response = await fetch(`${dhis2Url}/api/organisationUnits/${parentId}?fields=id,displayName,children[id,displayName],level`, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });
      const data = await response.json();
      const updatedOrgUnits = updateOrgUnits(orgUnits, parentPath, data);
      setOrgUnits(updatedOrgUnits);
    } catch (error) {
      console.error(`Error fetching child organisation units for ${parentId}:`, error);
    }
  };

  const updateOrgUnits = (units, path, data) => {
    if (path.length === 0) {
      return data.children || [];
    }

    const [head, ...tail] = path;
    const updatedUnits = units.map((unit) => {
      if (unit.id === head) {
        return {
          ...unit,
          children: updateOrgUnits(unit.children || [], tail, data),
        };
      }
      return unit;
    });

    return updatedUnits;
  };

  const handleOrgUnitExpand = (unitId, path) => {
    if (!expandedOrgUnits.includes(unitId)) {
      setExpandedOrgUnits([...expandedOrgUnits, unitId]);
      fetchChildOrgUnits(unitId, path);
    } else {
      setExpandedOrgUnits(expandedOrgUnits.filter((id) => id !== unitId));
    }
  };

  const handleOrgUnitSelect = (unitId) => {
    if (selectedOrgUnits.includes(unitId)) {
      setSelectedOrgUnits(selectedOrgUnits.filter((id) => id !== unitId));
    } else {
      setSelectedOrgUnits([...selectedOrgUnits, unitId]);
    }
    onSelect(unitId);
  };

  const renderTreeNodes = (units, path = []) => {
    return units.map((unit) => (
      <div key={unit.id} className="ml-4">
        <label>
          <input
            type="checkbox"
            checked={selectedOrgUnits.includes(unit.id)}
            onChange={() => handleOrgUnitSelect(unit.id)}
            className="mr-2"
          />
          {unit.displayName}
        </label>
        {unit.level !== 5 && ( // Assuming level 5 is the leaf node
          <button
            onClick={() => handleOrgUnitExpand(unit.id, [...path, unit.id])}
            className="ml-2 text-blue-500 hover:underline"
          >
            {expandedOrgUnits.includes(unit.id) ? 'Collapse' : 'Expand'}
          </button>
        )}
        {expandedOrgUnits.includes(unit.id) && unit.children && renderTreeNodes(unit.children, [...path, unit.id])}
      </div>
    ));
  };

  return <div>{renderTreeNodes(orgUnits)}</div>;
};

export default OrganisationUnitTree;
// import React, { useState, useEffect } from 'react';

// const OrganisationUnitTree = ({ dhis2Url, username, password, onSelect }) => {
//   const [orgUnits, setOrgUnits] = useState([]);
//   const [selectedOrgUnits, setSelectedOrgUnits] = useState([]);
//   const [expandedOrgUnits, setExpandedOrgUnits] = useState([]);

//   useEffect(() => {
//     const fetchRootOrgUnits = async () => {
//       try {
//         const response = await fetch(`${dhis2Url}/api/organisationUnits?level=1&fields=id,displayName,children[id,displayName]`, {
//           headers: {
//             Authorization: `Basic ${btoa(`${username}:${password}`)}`,
//           },
//         });
//         const data = await response.json();
//         setOrgUnits(data.organisationUnits);
//       } catch (error) {
//         console.error('Error fetching root organisation units:', error);
//       }
//     };
//     fetchRootOrgUnits();
//   }, [dhis2Url, username, password]);

//   const fetchChildOrgUnits = async (parentId, parentPath) => {
//     try {
//       const response = await fetch(`${dhis2Url}/api/organisationUnits/${parentId}?fields=id,displayName,children[id,displayName]`, {
//         headers: {
//           Authorization: `Basic ${btoa(`${username}:${password}`)}`,
//         },
//       });
//       const data = await response.json();
//       const updatedOrgUnits = updateOrgUnits(orgUnits, parentPath, data);
//       setOrgUnits(updatedOrgUnits);
//     } catch (error) {
//       console.error(`Error fetching child organisation units for ${parentId}:`, error);
//     }
//   };

//   const updateOrgUnits = (units, path, data) => {
//     if (path.length === 0) {
//       return data.children || [];
//     }

//     const [head, ...tail] = path;
//     const updatedUnits = units.map((unit) => {
//       if (unit.id === head) {
//         return {
//           ...unit,
//           children: updateOrgUnits(unit.children || [], tail, data),
//         };
//       }
//       return unit;
//     });

//     return updatedUnits;
//   };

//   const handleOrgUnitExpand = (unitId, path) => {
//     if (!expandedOrgUnits.includes(unitId)) {
//       setExpandedOrgUnits([...expandedOrgUnits, unitId]);
//       fetchChildOrgUnits(unitId, path);
//     }
//   };

//   const handleOrgUnitSelect = (unitId) => {
//     if (selectedOrgUnits.includes(unitId)) {
//       setSelectedOrgUnits(selectedOrgUnits.filter((id) => id !== unitId));
//     } else {
//       setSelectedOrgUnits([...selectedOrgUnits, unitId]);
//     }
//     onSelect(unitId);
//   };

//   const renderTreeNodes = (units, path = []) => {
//     return units.map((unit) => (
//       <div key={unit.id} className="ml-4">
//         <label>
//           <input
//             type="checkbox"
//             checked={selectedOrgUnits.includes(unit.id)}
//             onChange={() => handleOrgUnitSelect(unit.id)}
//             className="mr-2"
//           />
//           {unit.displayName}
//         </label>
//         <button
//           onClick={() => handleOrgUnitExpand(unit.id, [...path, unit.id])}
//           className="ml-2 text-blue-500 hover:underline"
//         >
//           {expandedOrgUnits.includes(unit.id) ? 'Collapse' : 'Expand'}
//         </button>
//         {expandedOrgUnits.includes(unit.id) && unit.children && renderTreeNodes(unit.children, [...path, unit.id])}
//       </div>
//     ));
//   };

//   return <div>{renderTreeNodes(orgUnits)}</div>;
// };

// export default OrganisationUnitTree;