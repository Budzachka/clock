"use strict";

window.LOCATIONS = [

  // UNITED STATES

  ["Birmingham","Alabama","USA","America/Chicago","🇺🇸"],

  ["Anchorage","Alaska","USA","America/Anchorage","🇺🇸"],
  ["Adak","Alaska","USA","America/Adak","🇺🇸"],

  ["Phoenix","Arizona","USA","America/Phoenix","🇺🇸"],
  ["Window Rock","Arizona","USA","America/Denver","🇺🇸"],

  ["Little Rock","Arkansas","USA","America/Chicago","🇺🇸"],

  ["Los Angeles","California","USA","America/Los_Angeles","🇺🇸"],

  ["Denver","Colorado","USA","America/Denver","🇺🇸"],

  ["Hartford","Connecticut","USA","America/New_York","🇺🇸"],

  ["Wilmington","Delaware","USA","America/New_York","🇺🇸"],

  ["Miami","Florida","USA","America/New_York","🇺🇸"],
  ["Pensacola","Florida","USA","America/Chicago","🇺🇸"],

  ["Atlanta","Georgia","USA","America/New_York","🇺🇸"],

  ["Honolulu","Hawaii","USA","Pacific/Honolulu","🇺🇸"],

  ["Boise","Idaho","USA","America/Boise","🇺🇸"],
  ["Coeur d'Alene","Idaho","USA","America/Los_Angeles","🇺🇸"],

  ["Chicago","Illinois","USA","America/Chicago","🇺🇸"],

  ["Indianapolis","Indiana","USA","America/Indiana/Indianapolis","🇺🇸"],
  ["Gary","Indiana","USA","America/Chicago","🇺🇸"],

  ["Des Moines","Iowa","USA","America/Chicago","🇺🇸"],

  ["Wichita","Kansas","USA","America/Chicago","🇺🇸"],
  ["Goodland","Kansas","USA","America/Denver","🇺🇸"],

  ["Louisville","Kentucky","USA","America/Kentucky/Louisville","🇺🇸"],
  ["Bowling Green","Kentucky","USA","America/Chicago","🇺🇸"],

  ["New Orleans","Louisiana","USA","America/Chicago","🇺🇸"],

  ["Portland","Maine","USA","America/New_York","🇺🇸"],

  ["Baltimore","Maryland","USA","America/New_York","🇺🇸"],

  ["Boston","Massachusetts","USA","America/New_York","🇺🇸"],

  ["Detroit","Michigan","USA","America/Detroit","🇺🇸"],
  ["Ironwood","Michigan","USA","America/Menominee","🇺🇸"],

  ["Minneapolis","Minnesota","USA","America/Chicago","🇺🇸"],

  ["Jackson","Mississippi","USA","America/Chicago","🇺🇸"],

  ["Kansas City","Missouri","USA","America/Chicago","🇺🇸"],

  ["Billings","Montana","USA","America/Denver","🇺🇸"],

  ["Omaha","Nebraska","USA","America/Chicago","🇺🇸"],
  ["Scottsbluff","Nebraska","USA","America/Denver","🇺🇸"],

  ["Las Vegas","Nevada","USA","America/Los_Angeles","🇺🇸"],

  ["Concord","New Hampshire","USA","America/New_York","🇺🇸"],

  ["Newark","New Jersey","USA","America/New_York","🇺🇸"],

  ["Albuquerque","New Mexico","USA","America/Denver","🇺🇸"],

  ["New York","New York","USA","America/New_York","🇺🇸"],

  ["Charlotte","North Carolina","USA","America/New_York","🇺🇸"],

  ["Bismarck","North Dakota","USA","America/Chicago","🇺🇸"],
  ["Dickinson","North Dakota","USA","America/Denver","🇺🇸"],

  ["Columbus","Ohio","USA","America/New_York","🇺🇸"],

  ["Oklahoma City","Oklahoma","USA","America/Chicago","🇺🇸"],

  ["Portland","Oregon","USA","America/Los_Angeles","🇺🇸"],
  ["Ontario","Oregon","USA","America/Boise","🇺🇸"],

  ["Philadelphia","Pennsylvania","USA","America/New_York","🇺🇸"],

  ["Providence","Rhode Island","USA","America/New_York","🇺🇸"],

  ["Columbia","South Carolina","USA","America/New_York","🇺🇸"],

  ["Sioux Falls","South Dakota","USA","America/Chicago","🇺🇸"],
  ["Rapid City","South Dakota","USA","America/Denver","🇺🇸"],

  ["Nashville","Tennessee","USA","America/Chicago","🇺🇸"],
  ["Knoxville","Tennessee","USA","America/New_York","🇺🇸"],

  ["Houston","Texas","USA","America/Chicago","🇺🇸"],
  ["El Paso","Texas","USA","America/Denver","🇺🇸"],

  ["Salt Lake City","Utah","USA","America/Denver","🇺🇸"],

  ["Burlington","Vermont","USA","America/New_York","🇺🇸"],

  ["Richmond","Virginia","USA","America/New_York","🇺🇸"],

  ["Seattle","Washington","USA","America/Los_Angeles","🇺🇸"],

  ["Charleston","West Virginia","USA","America/New_York","🇺🇸"],

  ["Milwaukee","Wisconsin","USA","America/Chicago","🇺🇸"],

  ["Cheyenne","Wyoming","USA","America/Denver","🇺🇸"],


  // CANADA

  ["St. John's","Newfoundland and Labrador","Canada","America/St_Johns","🇨🇦"],

  ["Halifax","Nova Scotia","Canada","America/Halifax","🇨🇦"],

  ["Charlottetown","Prince Edward Island","Canada","America/Halifax","🇨🇦"],

  ["Moncton","New Brunswick","Canada","America/Moncton","🇨🇦"],

  ["Montreal","Quebec","Canada","America/Toronto","🇨🇦"],
  ["Quebec City","Quebec","Canada","America/Toronto","🇨🇦"],

  ["Toronto","Ontario","Canada","America/Toronto","🇨🇦"],
  ["Thunder Bay","Ontario","Canada","America/Thunder_Bay","🇨🇦"],

  ["Winnipeg","Manitoba","Canada","America/Winnipeg","🇨🇦"],

  ["Regina","Saskatchewan","Canada","America/Regina","🇨🇦"],
  ["Lloydminster","Saskatchewan","Canada","America/Edmonton","🇨🇦"],

  ["Calgary","Alberta","Canada","America/Edmonton","🇨🇦"],

  ["Vancouver","British Columbia","Canada","America/Vancouver","🇨🇦"],
  ["Cranbrook","British Columbia","Canada","America/Edmonton","🇨🇦"],

  ["Whitehorse","Yukon","Canada","America/Whitehorse","🇨🇦"],

  ["Yellowknife","Northwest Territories","Canada","America/Yellowknife","🇨🇦"],

  ["Iqaluit","Nunavut","Canada","America/Iqaluit","🇨🇦"],
  ["Rankin Inlet","Nunavut","Canada","America/Rankin_Inlet","🇨🇦"],
  ["Cambridge Bay","Nunavut","Canada","America/Cambridge_Bay","🇨🇦"]

];

window.LOCATIONS = window.LOCATIONS.map(
  ([city, region, country, timeZone, flag]) => ({
    id: `${country.toLowerCase()}-${region.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${city.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    city,
    region,
    country,
    timeZone,
    flag
  })
);
