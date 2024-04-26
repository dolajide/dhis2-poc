# DHIS2 Data Downloader

The DHIS2 Data Downloader is a React-based Electron application that allows users to connect to a DHIS2 (District Health Information Software 2) instance, select specific data elements, and download the corresponding data in CSV format.

## Features

- **DHIS2 Connection**: Users can enter their DHIS2 instance URL, username, and password to establish a connection to the DHIS2 server.
- **Organisation Unit Selection**: The app provides an organisation unit tree view, allowing users to select specific organisation units for data retrieval.
- **Data Element Selection**: Users can search and select the desired data elements from a list of available options.
- **Period Selection**: The app supports two types of period selection: years and months. Users can specify a start and end period for data retrieval.
- **Category Combination**: Users can select a category combination to filter the data based on specific categories.
- **Data Download**: Once the necessary parameters are selected, users can initiate the data download process. The app retrieves the data from the DHIS2 server and generates a CSV file for download.

## Benefits

The DHIS2 Data Downloader offers several benefits to users:

- **Simplified Data Access**: The app provides a user-friendly interface to connect to a DHIS2 instance and retrieve specific data elements, eliminating the need for complex manual queries.
- **Customizable Data Selection**: Users can select specific organisation units, data elements, periods, and category combinations to tailor the downloaded data to their specific requirements.
- **CSV Format**: The downloaded data is provided in CSV format, which is widely supported and can be easily imported into various data analysis and visualization tools.
- **Time-Saving**: The app saves users time and effort compared to manually extracting data from the DHIS2 system.

## Technical Details

The DHIS2 Data Downloader is built using React, and leverages the Electron framework to create a cross-platform desktop application. The app communicates with the DHIS2 server using the DHIS2 API to retrieve data elements, organisation units, and other necessary information. The downloaded data is formatted and exported as a CSV file using client-side JavaScript. More work still required. did this in a couple of hours 😃. Requires npm/yarn

- yarn electron:start. This starts a local instance
- yarn electron:package:mac. packages a mac desktop app. find in dist folder in the base app directory
- yarn electron:package:win.  packages a windows desktop app. find in dist folder in the base app directory
- yarn electron:package:linux.  packages a linux desktop app. find in dist folder in the base app directory