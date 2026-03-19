import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type ChecklistItem = {
    id : Text;
    section : Text;
    task : Text;
    status : { #Pass; #Fail; #NA; #Unchecked };
    comment : Text;
  };

  type Report = {
    id : Text;
    month : Nat;
    year : Nat;
    clientName : Text;
    systemId : Text;
    inspectedBy : Text;
    date : Text;
    solarGenerationUnits : Text;
    solarGenerationPerMonth : Text;
    items : [ChecklistItem];
    notes : Text;
    submitted : Bool;
    submittedAt : ?Int;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  func compareReports(r1 : Report, r2 : Report) : Order.Order {
    Text.compare(r1.id, r2.id);
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let reports = Map.empty<Text, Report>();

  let checklistTemplate : [ChecklistItem] = [
    { id = "sm1"; section = "Solar Modules"; task = "Cleaning & wiping with fresh water"; status = #Unchecked; comment = "" },
    { id = "sm2"; section = "Solar Modules"; task = "Visual Inspection of modules, mounting clamps, MC4 connectors"; status = #Unchecked; comment = "" },
    { id = "sm3"; section = "Solar Modules"; task = "Check modules for any broken glass/discolouration, misalignment"; status = #Unchecked; comment = "" },
    { id = "mms1"; section = "Module Mounting Structure"; task = "Visual inspection of mounting structures, screws and fasteners"; status = #Unchecked; comment = "" },
    { id = "mms2"; section = "Module Mounting Structure"; task = "Tightening of screw and fasteners as needed"; status = #Unchecked; comment = "" },
    { id = "mms3"; section = "Module Mounting Structure"; task = "Check for rust accumulation"; status = #Unchecked; comment = "" },
    { id = "jb1"; section = "Junction Box"; task = "Checking and tightening of solar interconnection"; status = #Unchecked; comment = "" },
    { id = "jb2"; section = "Junction Box"; task = "Visual inspection of junction box and wiring"; status = #Unchecked; comment = "" },
    { id = "jb3"; section = "Junction Box"; task = "Tightening any interconnection as needed"; status = #Unchecked; comment = "" },
    { id = "inv1"; section = "Inverters"; task = "General cleaning"; status = #Unchecked; comment = "" },
    { id = "inv2"; section = "Inverters"; task = "Check for LCD display of inverters"; status = #Unchecked; comment = "" },
    { id = "inv3"; section = "Inverters"; task = "Check integrity of wiring"; status = #Unchecked; comment = "" },
    { id = "inv4"; section = "Inverters"; task = "Visual inspection of mechanical fixings of inverters"; status = #Unchecked; comment = "" },
    { id = "inv5"; section = "Inverters"; task = "Inspection of cables"; status = #Unchecked; comment = "" },
    { id = "inv6"; section = "Inverters"; task = "Visual inspection of AC and DC cables"; status = #Unchecked; comment = "" },
    { id = "db1"; section = "Distribution Boards"; task = "Checking ACDB for functioning, connections, metering, switchgears, etc."; status = #Unchecked; comment = "" },
    { id = "db2"; section = "Distribution Boards"; task = "Checking DCDB for functioning, connections, metering, switchgears, etc."; status = #Unchecked; comment = "" },
    { id = "gs1"; section = "General System Check and Cleaning"; task = "Inspect all connectors, contactors, switchboards, and wiring for signs of corrosion and/or burning"; status = #Unchecked; comment = "" },
    { id = "gs2"; section = "General System Check and Cleaning"; task = "Checking for MCB and fuses"; status = #Unchecked; comment = "" },
    { id = "gs3"; section = "General System Check and Cleaning"; task = "Checking of overall system"; status = #Unchecked; comment = "" },
    { id = "gs4"; section = "General System Check and Cleaning"; task = "Preparing total report of the visit"; status = #Unchecked; comment = "" },
  ];

  func generateReportId() : Text {
    Time.now().toText() # "RPT";
  };

  public shared func createReport(month : Nat, year : Nat) : async Text {
    let id = generateReportId();
    let newReport : Report = {
      id; month; year;
      clientName = ""; systemId = ""; inspectedBy = ""; date = "";
      solarGenerationUnits = ""; solarGenerationPerMonth = "";
      items = checklistTemplate; notes = "";
      submitted = false; submittedAt = null;
      createdAt = Time.now();
    };
    reports.add(id, newReport);
    id;
  };

  public shared func updateChecklistItem(reportId : Text, itemId : Text, status : { #Pass; #Fail; #NA; #Unchecked }, comment : Text) : async () {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        let updatedItems = report.items.map(
          func(item) {
            if (item.id == itemId) {
              { id = item.id; section = item.section; task = item.task; status; comment };
            } else { item };
          }
        );
        reports.add(reportId, { id = report.id; month = report.month; year = report.year;
          clientName = report.clientName; systemId = report.systemId;
          inspectedBy = report.inspectedBy; date = report.date;
          solarGenerationUnits = report.solarGenerationUnits;
          solarGenerationPerMonth = report.solarGenerationPerMonth;
          items = updatedItems; notes = report.notes;
          submitted = report.submitted; submittedAt = report.submittedAt;
          createdAt = report.createdAt;
        });
      };
    };
  };

  public shared func updateReportMetadata(reportId : Text, clientName : Text, systemId : Text, inspectedBy : Text, date : Text, solarGenerationUnits : Text, solarGenerationPerMonth : Text, notes : Text) : async () {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        reports.add(reportId, { id = report.id; month = report.month; year = report.year;
          clientName; systemId; inspectedBy; date;
          solarGenerationUnits; solarGenerationPerMonth;
          items = report.items; notes;
          submitted = report.submitted; submittedAt = report.submittedAt;
          createdAt = report.createdAt;
        });
      };
    };
  };

  public shared func submitReport(reportId : Text) : async () {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) {
        reports.add(reportId, { id = report.id; month = report.month; year = report.year;
          clientName = report.clientName; systemId = report.systemId;
          inspectedBy = report.inspectedBy; date = report.date;
          solarGenerationUnits = report.solarGenerationUnits;
          solarGenerationPerMonth = report.solarGenerationPerMonth;
          items = report.items; notes = report.notes;
          submitted = true; submittedAt = ?Time.now();
          createdAt = report.createdAt;
        });
      };
    };
  };

  public query func listReports() : async [Report] {
    reports.values().toArray().sort(compareReports);
  };

  public query func getReport(reportId : Text) : async Report {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?report) { report };
    };
  };

  public shared func deleteReport(reportId : Text) : async () {
    switch (reports.get(reportId)) {
      case (null) { Runtime.trap("Report not found") };
      case (?_) { reports.remove(reportId) };
    };
  };
};
