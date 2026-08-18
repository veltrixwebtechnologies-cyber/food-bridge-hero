# FoodBridge Connect

Create a complete, modern, professional and responsive web application for a Smart Food Donation Network called “FoodBridge”.

Project Theme:

Hunger-Free Community + Sustainable Development

Tagline:

“Save Food. Share Hope. Build a Hunger-Free Community.”

Problem:

Every day, surplus food from homes, restaurants, hotels, events, canteens and functions is wasted, while many people still struggle to get sufficient food. Donors often do not know which NGO or community nearby needs the food. Create a real-time digital platform that connects food donors with nearby NGOs and food receivers, reducing food waste and helping people in need.

IMPORTANT:

This is for a Smart India Hackathon (SIH) prototype. The website should look like a real startup/product, not like a basic college project. Make the UI attractive, clean, modern, professional and easy for judges to understand.

TECHNOLOGY:

Use HTML5, CSS3 and JavaScript for the frontend.

Use Firebase for authentication and database.

Use Google Maps or OpenStreetMap integration for location-based matching.

Make the project responsive for laptop, tablet and mobile.

Use clean component-based structure if using React.

Use icons where appropriate.

Do not use unnecessary animations that make the website slow.

WEBSITE NAME:

FoodBridge

MAIN NAVIGATION:

Home

How It Works

Donate Food

Find Food

Live Donations

Map

Dashboard

About

Login / Register

HOME PAGE:

Create an attractive hero section with:

FoodBridge logo/icon

Headline:

“Turn Surplus Food Into Hope”

Subheading:

“Connecting surplus food with nearby NGOs and communities in real time.”

Buttons:

“Donate Food”

“Find Food”

“Explore Live Donations”

Add a visual section showing:

Donor → FoodBridge → NGO → People in Need

Add statistics cards:

Food Donations

Meals Rescued

NGOs Connected

People Served

Food Waste Reduced

Add a “Why FoodBridge?” section with:

Reduce Food Waste

Real-Time Matching

Location-Based Connection

Quick Pickup

Transparent Tracking

Community Impact

DONOR MODULE:

Create a dedicated Donate Food page.

Donor form should contain:

Donor Name

Organization / Restaurant / Hotel Name

Phone Number

Email

Food Type

Food Category

Vegetarian / Non-Vegetarian

Quantity

Number of Servings

Food Preparation Time

Best Before Time

Pickup Address

Current Location

Available Pickup Time

Food Description

Upload Food Image

Add a checkbox:

“I confirm that the food is safe and suitable for donation.”

Add button:

“Post Donation”

After submission:

Show a success message:

“Food donation posted successfully.”

Generate a unique Donation ID.

DONOR DASHBOARD:

Show:

Active Donations

Accepted Donations

Completed Donations

Cancelled Donations

Each donation card should show:

Donation ID

Food Type

Quantity

Location

Available Time

Status

Matched NGO

Pickup Status

NGO / RECEIVER MODULE:

Create a Find Food page.

NGO can enter:

Organization Name

Contact Person

Phone

Location

Required Food Type

Required Quantity

Number of People

Urgency Level

Required Time

Show available nearby donations.

Each donation card should contain:

Food Type

Quantity

Distance

Donor Type

Pickup Location

Available Time

Food Status

Posted Time

Add:

“Accept Donation”

After accepting:

Change status from:

Available → Accepted → Pickup in Progress → Completed

SMART MATCHING SYSTEM:

This is the main innovation of the project.

Create a smart matching algorithm that considers:

1. Distance between donor and NGO

2. Quantity required vs quantity available

3. Food type/category

4. Food availability time

5. Urgency level

6. Pickup feasibility

Display:

“Best Match”

Example:

Restaurant A has 100 meals available.

NGO B needs 80 meals.

Distance = 2.4 km.

Availability = within 1 hour.

Show:

“Recommended Match – 95% Match”

Create a matching score using a simple formula and display it visually.

LIVE DONATION PAGE:

Create a page called “Live Donations”.

Display active food donations as cards.

Each card:

Food image

Food name

Quantity

Location

Distance

Time remaining

Donor type

Status

Accept button

Add filters:

Food Type

Distance

Quantity

Urgency

Time

Add search functionality.

MAP PAGE:

Create an interactive map.

Show markers for:

Food Donors

NGOs

Food Banks

Active Donations

Use different marker icons.

When clicking a marker, show:

Name

Food availability

Quantity

Location

Distance

Contact

Accept / View Details

Add:

“Find Nearest NGO”

and

“Find Nearest Donation”

Use geolocation when permission is granted.

DASHBOARD:

Create a professional dashboard.

Display cards:

Total Food Donations

Active Donations

Completed Donations

Meals Rescued

NGOs Connected

People Served

Estimated Food Waste Reduced

Add charts:

Donations by Day

Food Category Distribution

Meals Rescued

Completed vs Pending Donations

Create recent activity:

Donation Posted

NGO Accepted

Pickup Started

Donation Completed

ADMIN PANEL:

Create an Admin Dashboard.

Admin can:

View all users

View donors

View NGOs

View donations

View requests

Verify NGOs

Approve / reject donations

Monitor active donations

Track completed donations

View statistics

Manage reported issues

ABOUT PAGE:

Explain:

What is FoodBridge?

Why food waste is a problem?

How the platform works?

Who can use it?

User types:

Restaurants

Hotels

Event Organizers

Canteens

Households

NGOs

Food Banks

Community Organizations

HOW IT WORKS PAGE:

Show 4 simple steps:

1. Donate

Donor posts surplus food.

2. Match

FoodBridge finds suitable nearby NGOs.

3. Connect

NGO accepts the donation.

4. Deliver

Food is picked up and distributed.

IMPACT PAGE:

Show environmental and social impact.

Examples:

Meals rescued

People served

Food waste reduced

Donations completed

NGOs connected

Create an “Impact Counter” section.

NOTIFICATION SYSTEM:

Create notification UI for:

New donation available

Donation accepted

Pickup reminder

Donation completed

Request matched

LOGIN / REGISTER:

Create authentication pages.

Allow users to select:

Donor

NGO

Admin

Registration fields:

Name

Email

Phone

Password

Location

Organization Name if applicable

Use Firebase Authentication.

DATABASE:

Create Firebase database structure for:

users

donations

food_requests

matches

notifications

pickup_tracking

impact_statistics

Each donation should have:

donationId

donorId

foodType

quantity

servings

location

latitude

longitude

availableTime

expiryTime

status

matchedNgoId

createdAt

SECURITY:

Users should only be able to edit their own donations.

NGOs should only accept available donations.

Admin should have full access.

Validate all forms.

Do not expose passwords or sensitive information.

UI DESIGN:

Use a clean green + white theme representing food, sustainability and community.

Use:

Rounded cards

Modern buttons

Clean typography

Professional icons

Soft shadows

Responsive layouts

Accessible contrast

Do not make the website overly colorful.

Keep it professional enough for an SIH presentation.

Add a footer containing:

FoodBridge

“Save Food. Share Hope.”

Quick Links

Contact

Social icons

Copyright

DEMO DATA:

Add sample data so the website does not look empty during the hackathon presentation.

Example donations:

1. 120 vegetarian meals – Restaurant – 2.1 km

2. 50 meals – College Canteen – 3.5 km

3. 80 meals – Event Hall – 1.8 km

4. 30 food packets – Household – 4.2 km

Example NGOs:

Hope Foundation

Care Community

Food Support Center

Hunger Relief NGO

Add realistic statuses:

Available

Matched

Accepted

Pickup in Progress

Completed

RESPONSIVENESS:

The website must work properly on:

Desktop

Laptop

Tablet

Mobile

Create a mobile navigation menu.

ERROR HANDLING:

Show proper messages for:

Invalid form

Missing location

No nearby NGO

Donation already accepted

Expired donation

Network error

EMPTY STATES:

If there are no donations, show:

“No active food donations found nearby.”

If no NGO is available:

“No suitable NGO found nearby. We will notify you when a match becomes available.”

SIH DEMO MODE:

Create a simple demo mode so judges can test the system easily.

Add:

“Demo Login”

Demo users:

Donor

NGO

Admin

Create a complete end-to-end demonstration:

Donor logs in

→ Posts 100 meals

→ System detects location

→ Finds nearest NGO

→ Calculates match score

→ NGO receives notification

→ NGO accepts

→ Pickup status updates

→ Donation marked completed

→ Dashboard statistics update

IMPORTANT:

The final website should feel like a real-world deployable product and clearly demonstrate the core innovation: real-time, location-based, smart matching of surplus food with nearby NGOs.

Also include clear comments in the code explaining important sections.

Generate all necessary frontend files and code.

Ensure there are no broken links, missing files, console errors or non-working buttons.

Make all major buttons functional.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://food-bridge-hero.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e8b24783-42f1-496a-b3c1-3f08e70136ed).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
