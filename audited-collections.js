// Write your package code here!
AuditLogs = new Mongo.Collection('auditlogs');

AuditLogs.metadataGetters = [];

// registers a function which will get metadata to be logged from a document
// function should take the document as the only argument and should return an
// object who's keys will be stored as metadata.
AuditLogs.registerMetadata = function (fn) {
  AuditLogs.metadataGetters.push(fn);
};

AuditLogs.getMetadata = function (doc, context) {
  var metadata = {};
  _.each(AuditLogs.metadataGetters, function (getter) {
    try {
      _.extend(metadata, getter.call(context, doc));
    } catch (e) {
      Meteor.setTimeout(function () {throw e;}, 0);
    }
  });
  return metadata;
};

AuditLogs.logSnapshots = function () {
  AuditLogs.registerMetadata(function (doc) {
    return {
      snapshot: doc
    };
  });
};

AuditLogs.logFieldNames = function () {
  AuditLogs.registerMetadata(function (doc) {
    return {
      fieldNames: this.fieldNames
    };
  });
};

AuditLogs.logModifiers = function () {
  AuditLogs.registerMetadata(function (doc) {
    return {
      modifier: this.modifier || doc
    };
  });
};

// These are fields which application code and user actions should not be
// allowedto modify.
// XXX we should enforce this. We should use a deny method for each of these
// fields, note that collection hooks run before the allow/deny logic.
AuditLogs.reservedFields = ['dateModified', 'dateCreated'];

AuditedCollection = function (name) {
  var result = new Mongo.Collection(name);
  result.before.insert(function (userId, doc) {
    // Note this silently overwrites any existing dateCreated property
    doc.dateCreated = new Date();
  });
  result.before.update(function (userId, doc, fieldNames, modifier, options) {
    modifier.$set = modifier.$set || {};

    // Note this silently overwrites any existing dateModified property
    modifier.$set.dateModified = new Date();
  });
  result.after.insert(function (userId, doc) {
    var metadata = AuditLogs.getMetadata(doc, {
      collectionName: name
      , userId: userId
    });
    metadata.documentId = doc._id;
    metadata.userId = userId;
    metadata.dateLogged = new Date();
    metadata.actionType = 'insert';
    metadata.collectionName = name;

    AuditLogs.insert(metadata);
  });
  result.after.update(function (userId, doc, fieldNames, modifier, options) {
    var metadata = AuditLogs.getMetadata(doc, {
      collectionName: name
      , userId: userId
      , fieldNames: fieldNames
      , modifier: modifier
      , options: options
    });
    metadata.documentId = doc._id;
    metadata.userId = userId;
    metadata.dateLogged = new Date();
    metadata.actionType = 'update';
    metadata.collectionName = name;

    AuditLogs.insert(metadata);
  });
  result.after.remove(function (userId, doc) {
    var metadata = AuditLogs.getMetadata(doc, {
      collectionName: name
      , userId: userId
    });
    metadata.documentId = doc._id;
    metadata.userId = userId;
    metadata.dateLogged = new Date();
    metadata.actionType = 'remove';
    metadata.collectionName = name;

    AuditLogs.insert(metadata);
  });
  return result;
};
