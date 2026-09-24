# Community annotation storage

Non-admin annotations live in `annotations/{uid}_{md5(analysisKey)}` with
`ownerId`, `author` (Google display name, never email), `analysisKey`, and
`analysis`. All visitors can read these annotations; only the owner can write
or delete them. Admin annotations continue to use `users/{adminUid}.analyses`,
which is the only source read by `scripts/rawl/update-corpus.js`.

In Firebase Console → Firestore Database → Rules, replace the rules with the
complete ruleset below and publish. It preserves the existing public reads,
admin writes to other collections, and `edits` permissions. Community annotation
writes are restricted to their owner. The deployed rules are not managed by an
automated deployment in this repository.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{document=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == "RK31rsh4tDdUGlNYQvakXW4AYbB3"
        && collection != "annotations";
    }

    match /edits/{editId} {
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && resource.data.owner == request.auth.uid;
    }

    match /annotations/{annotationId} {
      function ownsExisting() {
        return request.auth != null
          && resource.data.ownerId == request.auth.uid;
      }
      function validAnnotation() {
        return request.auth != null
          && request.auth.uid != 'RK31rsh4tDdUGlNYQvakXW4AYbB3'
          && request.resource.data.keys().hasAll(['ownerId', 'author', 'analysisKey', 'analysis'])
          && request.resource.data.keys().hasOnly(['ownerId', 'author', 'analysisKey', 'analysis'])
          && request.resource.data.ownerId == request.auth.uid
          && annotationId.matches(request.auth.uid + '_[0-9a-f]{32}')
          && request.resource.data.author is string
          && request.resource.data.author.size() <= 256
          && request.resource.data.analysisKey is string
          && request.resource.data.analysisKey.size() > 0
          && request.resource.data.analysisKey.size() <= 4096
          && request.resource.data.analysis is map;
      }
      allow read: if true;
      allow create: if validAnnotation();
      allow update: if ownsExisting() && validAnnotation()
        && request.resource.data.analysisKey == resource.data.analysisKey;
      allow delete: if ownsExisting();
    }
  }
}
```

The browser loads community versions when the app opens; reload to see changes
made in another browser. The selector defaults to your own version, then the
admin version, then an available contributor version. Editing any displayed
version saves to your own account. Blue Lakh links take precedence over the
admin yellow/pink colors whenever a contributor version exists.

Legacy personal annotations in `users/{uid}.analyses` remain accessible to
their owner. Saving one publishes it to the new collection. The app does not enumerate
user documents; the existing rules above still allow public reads of them.

Manual verification (using the existing development server):

- Sign in as a non-admin, edit a piece, reload, and confirm the changes persist.
- In another account or signed-out browser, open the same piece and switch
  between authors. Confirm edits from the second account create its own version.
- Confirm Lakh artist and track links, including search results and alternate
  recordings, turn blue when a non-admin version exists.
- Delete your version through My annotation JSON; confirm other versions remain.
- Confirm admin saving still writes only to the admin user document and
  `update-corpus` still reads only that document.
- With the Firestore rules simulator, confirm anonymous writes and attempts to
  change or delete another user's annotation are denied, while reads succeed.
