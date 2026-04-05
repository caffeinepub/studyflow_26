import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";

actor {
  type Subject = {
    #physics;
    #chemistry;
    #maths;
  };

  module Subject {
    public func toText(subject : Subject) : Text {
      switch (subject) {
        case (#physics) { "Physics" };
        case (#chemistry) { "Chemistry" };
        case (#maths) { "Maths" };
      };
    };
  };

  type ChapterStatus = {
    #completed;
    #pending;
  };

  type ChapterTag = {
    #weakTag;
    #strong;
    #neutral;
  };

  type MistakeType = {
    #concept;
    #silly;
    #formula;
  };

  type ExamConfig = {
    examName : Text;
    examDate : Time.Time;
    dailyPYQGoal : Nat;
    weeklyGoal : Nat;
  };

  type PYQEntry = {
    id : Nat;
    date : Text;
    subject : Subject;
    target : Nat;
    completed : Nat;
    correct : Nat;
    wrong : Nat;
    startTime : Time.Time;
    endTime : Time.Time;
  };

  type Chapter = {
    id : Nat;
    subject : Subject;
    name : Text;
    pyqsDone : Nat;
    status : ChapterStatus;
    tag : ChapterTag;
    mistakeCount : Nat;
  };

  type Mistake = {
    id : Nat;
    subject : Subject;
    chapterName : Text;
    mistakeType : MistakeType;
    description : Text;
    date : Text;
    repeatCount : Nat;
  };

  type StudySession = {
    id : Nat;
    date : Text;
    durationSeconds : Nat;
    notes : Text;
  };

  type DailyRecord = {
    date : Text;
    totalPYQs : Nat;
    goalMet : Bool;
    studySeconds : Nat;
  };

  module DailyRecord {
    public func compare(record1 : DailyRecord, record2 : DailyRecord) : Order.Order {
      Text.compare(record1.date, record2.date);
    };
  };

  let examConfig = Map.empty<Text, ExamConfig>();
  let pyqEntries = Map.empty<Nat, PYQEntry>();
  let chapters = Map.empty<Nat, Chapter>();
  let mistakes = Map.empty<Nat, Mistake>();
  let studySessions = Map.empty<Nat, StudySession>();
  let dailyRecords = Map.empty<Text, DailyRecord>();

  var nextPyqId = 0;
  var nextChapterId = 0;
  var nextMistakeId = 0;
  var nextStudySessionId = 0;

  public shared ({ caller }) func setExamConfig(name : Text, config : ExamConfig) : async () {
    examConfig.add(name, config);
  };

  public query ({ caller }) func getExamConfig(name : Text) : async ExamConfig {
    switch (examConfig.get(name)) {
      case (null) { Runtime.trap("Exam config not found") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func createPYQEntry(entry : PYQEntry) : async Nat {
    let id = nextPyqId;
    nextPyqId += 1;
    let newEntry = { entry with id };
    pyqEntries.add(id, newEntry);
    id;
  };

  public shared ({ caller }) func updatePYQEntry(id : Nat, entry : PYQEntry) : async () {
    if (not pyqEntries.containsKey(id)) {
      Runtime.trap("PYQ entry not found");
    };
    pyqEntries.add(id, entry);
  };

  public shared ({ caller }) func deletePYQEntry(id : Nat) : async () {
    if (not pyqEntries.containsKey(id)) {
      Runtime.trap("PYQ entry not found");
    };
    pyqEntries.remove(id);
  };

  public query ({ caller }) func getPYQEntry(id : Nat) : async PYQEntry {
    switch (pyqEntries.get(id)) {
      case (null) { Runtime.trap("PYQ entry not found") };
      case (?entry) { entry };
    };
  };

  public shared ({ caller }) func createChapter(chapter : Chapter) : async Nat {
    let id = nextChapterId;
    nextChapterId += 1;
    let newChapter = { chapter with id };
    chapters.add(id, newChapter);
    id;
  };

  public shared ({ caller }) func updateChapter(id : Nat, chapter : Chapter) : async () {
    if (not chapters.containsKey(id)) {
      Runtime.trap("Chapter not found");
    };
    chapters.add(id, chapter);
  };

  public shared ({ caller }) func deleteChapter(id : Nat) : async () {
    if (not chapters.containsKey(id)) {
      Runtime.trap("Chapter not found");
    };
    chapters.remove(id);
  };

  public query ({ caller }) func getChapter(id : Nat) : async Chapter {
    switch (chapters.get(id)) {
      case (null) { Runtime.trap("Chapter not found") };
      case (?chapter) { chapter };
    };
  };

  public shared ({ caller }) func createMistake(mistake : Mistake) : async Nat {
    let id = nextMistakeId;
    nextMistakeId += 1;
    let newMistake = { mistake with id };
    mistakes.add(id, newMistake);
    id;
  };

  public shared ({ caller }) func incrementMistakeRepeatCount(id : Nat) : async () {
    switch (mistakes.get(id)) {
      case (null) {
        Runtime.trap("Mistake not found");
      };
      case (?mistake) {
        let updatedMistake = {
          mistake with repeatCount = mistake.repeatCount + 1;
        };
        mistakes.add(id, updatedMistake);
      };
    };
  };

  public shared ({ caller }) func deleteMistake(id : Nat) : async () {
    if (not mistakes.containsKey(id)) {
      Runtime.trap("Mistake not found");
    };
    mistakes.remove(id);
  };

  public query ({ caller }) func getMistake(id : Nat) : async Mistake {
    switch (mistakes.get(id)) {
      case (null) { Runtime.trap("Mistake not found") };
      case (?mistake) { mistake };
    };
  };

  public shared ({ caller }) func createStudySession(session : StudySession) : async Nat {
    let id = nextStudySessionId;
    nextStudySessionId += 1;
    let newSession = { session with id };
    studySessions.add(id, newSession);
    id;
  };

  public shared ({ caller }) func updateStudySession(id : Nat, session : StudySession) : async () {
    if (not studySessions.containsKey(id)) {
      Runtime.trap("Study session not found");
    };
    studySessions.add(id, session);
  };

  public shared ({ caller }) func deleteStudySession(id : Nat) : async () {
    if (not studySessions.containsKey(id)) {
      Runtime.trap("Study session not found");
    };
    studySessions.remove(id);
  };

  public query ({ caller }) func getStudySession(id : Nat) : async StudySession {
    switch (studySessions.get(id)) {
      case (null) { Runtime.trap("Study session not found") };
      case (?session) { session };
    };
  };

  public shared ({ caller }) func upsertDailyRecord(record : DailyRecord) : async () {
    dailyRecords.add(record.date, record);
  };

  public query ({ caller }) func getDailyRecord(date : Text) : async DailyRecord {
    switch (dailyRecords.get(date)) {
      case (null) { Runtime.trap("Daily record not found") };
      case (?record) { record };
    };
  };

  public query ({ caller }) func getAllDailyRecords() : async [DailyRecord] {
    dailyRecords.values().toArray().sort();
  };
};
