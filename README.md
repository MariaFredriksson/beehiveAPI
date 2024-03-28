# Beehive Monitoring System API Documentation

The Beehive Monitoring System API is designed to enable users to manage and monitor beehive-related data efficiently. It provides a set of RESTful endpoints for managing beehives, harvest data, user accounts, mobile beehive requests, and webhooks.

## Table of Contents

- [Introduction](#beehive-monitoring-system-api-documentation)
- [Table of Contents](#table-of-contents)
- [Base URL](#base-url)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [User Management](#user-management)
  - [Beehive Management](#beehive-management)
  - [Hive Status Management](#hive-status-management)
  - [Harvest Data](#harvest-data)
  - [Mobile Beehive Requests](#mobile-beehive-requests)
  - [Webhooks](#webhooks)
- [Error Handling](#error-handling)
- [Security Features](#security-features)


## Base URL
All URLs referenced in the documentation have the base URL 
`https://cscloud8-68.lnu.se/api-assignment/api/v1/`


## API Overview

The API is structured around several key components, each dedicated to a specific aspect of beehive monitoring and management:

- **Beehives**: Manage beehive registrations, updates, and deletions.
- **Harvest Reports**: Track and record harvest data.
- **User Accounts**: Handle user registration, authentication, and management.
- **Mobile Beehive Requests**: Process requests for mobile beehive units.
- **Webhooks**: Allow external services to receive notifications about events within the system.

## Authentication

The API uses JWT (JSON Web Tokens) for secure access to endpoints. To obtain a token, users must first authenticate via the `/user/login` endpoint. This token must be included in the `Authorization` header of subsequent requests that require authentication.

Example of use:
```http
GET /hives
Authorization: Bearer YOUR_ACCESS_TOKEN
```


## Endpoints

### User Management

- **POST /user/register**
  - **Description**: Registers a new user.
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123",
      "firstName": "John",
      "lastName": "Doe",
      "role": "farmer"
    }
    ```
  - **Roles**: The available roles at the moment are `farmer` and `IoTLabAdmin`. The `farmer` has access to all the endpoints where authentication is required, while the `IoTLabAdmin` only has access to Beehive Management, Hive Status Management, and Webhooks.
  - **Response**: Returns the registered user data and a link to the login endpoint.

- **POST /user/login**
  - **Description**: Authenticates a user and returns a JWT token.
  - **Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - **Response**: Returns a JWT token.

### Beehive Management

- **GET /hives**
  - **Description**: Fetches all the hives from the database.
  - **Authentication**: Required.
  - **Response**: Returns a list of all hives.

- **POST /hives**
  - **Description**: Adds a new hive to the database.
  - **Authentication**: Required.
  - **Body**:
    ```json
    {
      "hiveId": 1,
      "name": "Hive A",
      "location": "Location A",
      "registeredById": "UserId"
    }
    ```
  - **Response**: Returns the added hive data.

- **PUT /hives/:id**
  - **Description**: Updates a hive in the database.
  - **Authentication**: Required.
  - **Parameters**: `id` - The ID of the hive to update.
  - **Body**:
    ```json
    {
      "name": "Updated Hive Name",
      "location": "Updated Location"
    }
    ```
  - **Response**: Returns a success message and updated hive data.

- **DELETE /hives/:id**
  - **Description**: Deletes a hive and all related data from the database.
  - **Authentication**: Required.
  - **Parameters**: `id` - The ID of the hive to delete.
  - **Response**: Returns a success message.

### Hive Status Management

- **GET /hives/:id**
  - **Description**: Fetches the most recent data on flow, humidity, temperature, and weight for a specified hive.
  - **Authentication**: Required.
  - **Parameters**: `id` - The ID of the hive.
  - **Response**: Returns the latest data points for flow, humidity, temperature, and weight of the specified hive.

- **GET /hives/:id/flow**
  - **Description**: Fetches flow data for a specified hive. Can retrieve the most recent data or data within a specified timeframe.
  - **Authentication**: Required.
  - **Parameters**: 
    - `id` - The ID of the hive.
    - `startDate` (optional) - The start date of the timeframe (query parameter).
    - `endDate` (optional) - The end date of the timeframe (query parameter).
  - **Response**: Returns flow data for the specified hive. If `startDate` and `endDate` are provided, returns data within the specified timeframe. Otherwise the most recent data is returned.

- **GET /hives/:id/humidity**
  - **Description**: Fetches humidity data for a specified hive. Can retrieve the most recent data or data within a specified timeframe.
  - **Authentication**: Required.
  - **Parameters**: 
    - `id` - The ID of the hive.
    - `startDate` (optional) - The start date of the timeframe (query parameter).
    - `endDate` (optional) - The end date of the timeframe (query parameter).
  - **Response**: Returns humidity data for the specified hive. If `startDate` and `endDate` are provided, returns data within the specified timeframe. Otherwise the most recent data is returned.

- **GET /hives/:id/temperature**
  - **Description**: Fetches temperature data for a specified hive. Can retrieve the most recent data or data within a specified timeframe.
  - **Authentication**: Required.
  - **Parameters**: 
    - `id` - The ID of the hive.
    - `startDate` (optional) - The start date of the timeframe (query parameter).
    - `endDate` (optional) - The end date of the timeframe (query parameter).
  - **Response**: Returns temperature data for the specified hive. If `startDate` and `endDate` are provided, returns data within the specified timeframe. Otherwise the most recent data is returned.

- **GET /hives/:id/weight**
  - **Description**: Fetches weight data for a specified hive. Can retrieve the most recent data or data within a specified timeframe.
  - **Authentication**: Required.
  - **Parameters**: 
    - `id` - The ID of the hive.
    - `startDate` (optional) - The start date of the timeframe (query parameter).
    - `endDate` (optional) - The end date of the timeframe (query parameter).
  - **Response**: Returns weight data for the specified hive. If `startDate` and `endDate` are provided, returns data within the specified timeframe. Otherwise the most recent data is returned.


For example, to get the most recent weight data for a hive with ID 12345, you could make the following request:

```http
GET /hives/12345/weight
Authorization: Bearer YOUR_ACCESS_TOKEN
```

If you want to get weight data within a specific timeframe, you would include `startDate` and `endDate` query parameters like so:

```http
GET /hives/12345/weight?startDate=2023-01-01&endDate=2023-01-31
Authorization: Bearer YOUR_ACCESS_TOKEN
```


### Harvest Data

- **GET /harvest**
  - **Description**: Fetches all the harvest reports from the database.
  - **Authentication**: Required. Farmers only.
  - **Response**: Returns a list of all harvest reports.

- **POST /harvest**
  - **Description**: Adds a new harvest report to the database.
  - **Authentication**: Required. Farmers only.
  - **Body**:
    ```json
    {
      "hiveId": 1,
      "date": "2024-03-28",
      "amount": 10,
      "userId": "UserId"
    }
    ```
  - **Response**: Returns the added harvest report data.

### Mobile Beehive Requests

- **GET /mobile-beehive-request**
  - **Description**: Fetches all mobile beehive requests.
  - **Authentication**: Required. Farmers only.
  - **Response**: Returns a list of all mobile beehive requests.

- **POST /mobile-beehive-request**
  - **Description**: Adds a new mobile beehive request.
  - **Authentication**: Required. Farmers only.
  - **Body**:
    ```json
    {
      "location": "New Location",
      "startDate": "2024-04-01",
      "endDate": "2024-04-07",
      "requestedById": "UserId"
    }
    ```
  - **Response**: Returns the added mobile beehive request data.

### Webhooks

- **POST /webhook/register**
  - **Description**: Registers a new webhook URL.
  - **Authentication**: Required.
  - **Body**:
    ```json
    {
      "url": "https://webhook.site/unique-id",
      "events": ["addedHiveRequest", "moreHooksWhenTheyAreAdded"]
    }
    ```
  - **Response**: Returns a success message.

  At the moment there is only one hook available to sign up for: `addedHiveRequest`

## Error Handling

The API provides detailed error messages in JSON format in response to invalid requests. Common errors include `400 Bad Request` for invalid inputs and `401 Unauthorized` for authentication. Or,for instance, attempting to access a protected route without authentication will return:

```json
{
  "status": 401,
  "message": "Access token invalid or not provided."
}
```

## Security Features
* Helmet: Used to secure Express apps by setting various HTTP headers.
* JWT: Secures API endpoints through token-based authentication.
* bcryptjs: Encrypts user passwords before storing them in the database
* Data Validation: Ensures that all user inputs are validated before processing.
