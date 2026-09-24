import React from "react";
import Modal from "react-modal";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import { baseLinkStyles } from "./AppHeader";

const HeaderDiv = styled.div`
  ${baseLinkStyles}
  color: #888
`;

const AdminButton = styled.button`
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  font: inherit;
  margin-left: 12px;
  padding: 0;
  text-decoration: underline dotted #444;

  &:disabled {
    color: #555;
    cursor: default;
    text-decoration: none;
  }
`;

const ModalBody = styled.div`
  background: #111;
  color: #ddd;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: sans-serif;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const ModalTitle = styled.div`
  color: white;
  font-weight: 700;
`;

const JsonTextarea = styled.textarea`
  background: #050505;
  border: 1px solid #333;
  color: #eee;
  flex: 1;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  padding: 10px;
  resize: none;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ModalButton = styled.button`
  background: #222;
  border: 1px solid #444;
  color: white;
  cursor: pointer;
  padding: 6px 10px;

  &:disabled {
    color: #666;
    cursor: default;
  }
`;

const DangerButton = styled(ModalButton)`
  border-color: #733;
  color: #ff9b9b;
`;

const SignIn = ({
  user,
  handleLogin,
  handleLogout,
  handleToggleManualRemeasuring,
  enableManualRemeasuring,
  adminUserId,
  currentAnnotationKey,
}) => {
  const {
    analyses,
    annotationVersions,
    selectedAnnotationOwners,
    selectAnnotation,
    getFirebaseAnnotation,
    saveFirebaseAnnotation,
    deleteFirebaseAnnotation,
  } = React.useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [jsonText, setJsonText] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const versions = Object.values(
    annotationVersions[currentAnnotationKey] || {},
  );
  const ownAnnotation =
    user && annotationVersions[currentAnnotationKey]?.[user.uid];

  React.useEffect(() => {
    setIsModalOpen(false);
    setStatus("");
  }, [currentAnnotationKey, user?.uid]);

  const openAnnotationModal = async () => {
    if (!currentAnnotationKey) return;

    setIsModalOpen(true);
    setStatus("Loading Firebase annotation...");
    try {
      const annotation = await getFirebaseAnnotation(currentAnnotationKey);
      setJsonText(
        JSON.stringify(
          annotation || analyses[currentAnnotationKey] || {},
          null,
          2,
        ),
      );
      setStatus(
        annotation
          ? ""
          : "No saved annotation of your own yet. Saving creates your version.",
      );
    } catch (error) {
      console.error("Could not load Firebase annotation", error);
      setStatus("Could not load Firebase annotation.");
    }
  };

  const saveAnnotation = async () => {
    setStatus("");
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      setStatus(`Invalid JSON: ${error.message}`);
      return;
    }

    setIsSaving(true);
    try {
      await saveFirebaseAnnotation(currentAnnotationKey, parsed);
      setStatus("Saved.");
    } catch (error) {
      console.error("Could not save Firebase annotation", error);
      setStatus("Could not save Firebase annotation.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAnnotation = async () => {
    if (
      !window.confirm(
        `Delete your saved annotation for ${currentAnnotationKey}? Other authors’ annotations will remain available.`,
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteFirebaseAnnotation(currentAnnotationKey);
      setJsonText("{}");
      setStatus("Deleted Firebase annotation.");
    } catch (error) {
      console.error("Could not delete Firebase annotation", error);
      setStatus("Could not delete Firebase annotation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <HeaderDiv>
      {versions.length > 1 && (
        <select
          aria-label="Annotation author"
          title="Choose an annotation. Edits save to your own version."
          value={selectedAnnotationOwners[currentAnnotationKey] || ""}
          onChange={(event) =>
            selectAnnotation(currentAnnotationKey, event.target.value)
          }
          style={{
            background: "#111",
            color: "white",
            maxWidth: 190,
            marginRight: 12,
          }}
        >
          {versions.map(({ ownerId, author }) => (
            <option key={ownerId} value={ownerId}>
              {ownerId === user?.uid ? "You" : author}
              {ownerId === adminUserId && user?.uid === adminUserId
                ? " (Admin)"
                : ""}
              {ownerId !== adminUserId && ownerId !== user?.uid
                ? ` · ${ownerId.slice(0, 6)}`
                : ""}
            </option>
          ))}
        </select>
      )}
      {user && (
        <>
          <label className="inline">
            <input
              onChange={handleToggleManualRemeasuring}
              type="checkbox"
              checked={enableManualRemeasuring}
              name="manual-remeasuring"
            />
            Manual <u>R</u>emeasuring
          </label>
          <AdminButton
            type="button"
            onClick={openAnnotationModal}
            disabled={!currentAnnotationKey}
            title={
              currentAnnotationKey
                ? `Edit ${currentAnnotationKey}`
                : "Open a piece to edit its Firebase annotation"
            }
          >
            My annotation JSON
          </AdminButton>
        </>
      )}
      {user &&
        currentAnnotationKey &&
        !ownAnnotation &&
        analyses[currentAnnotationKey] && (
          <AdminButton
            type="button"
            disabled={isSaving}
            title="Save the displayed annotation as your own version"
            onClick={async () => {
              setIsSaving(true);
              try {
                await saveFirebaseAnnotation(
                  currentAnnotationKey,
                  analyses[currentAnnotationKey],
                );
              } catch (error) {
                window.alert(
                  "Could not save your annotation. Please try again.",
                );
              } finally {
                setIsSaving(false);
              }
            }}
          >
            Save my annotation
          </AdminButton>
        )}
      {user ? (
        <>
          {" • "}
          {user.email}
          {"   "}
          <a
            href="#"
            onClick={handleLogout}
            style={{
              marginLeft: "15px",
              textDecoration: "underline dotted #444",
            }}
          >
            Sign out
          </a>
        </>
      ) : (
        <>
          <a href="#" onClick={handleLogin} style={{ color: "#fff" }}>
            Sign in
          </a>{" "}
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Edit Firebase Annotation JSON"
        style={{
          content: {
            background: "#111",
            border: "1px solid #333",
            inset: "60px",
            padding: "16px",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 100000001,
          },
        }}
      >
        <ModalBody>
          <ModalHeader>
            <div>
              <ModalTitle>My annotation JSON</ModalTitle>
              <div>{currentAnnotationKey}</div>
            </div>
            <ModalButton type="button" onClick={() => setIsModalOpen(false)}>
              Close
            </ModalButton>
          </ModalHeader>
          <JsonTextarea
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            spellCheck={false}
          />
          {status && <div>{status}</div>}
          <ModalActions>
            <DangerButton
              type="button"
              onClick={deleteAnnotation}
              disabled={isSaving || !currentAnnotationKey}
            >
              Delete my annotation
            </DangerButton>
            <ActionGroup>
              <ModalButton
                type="button"
                onClick={saveAnnotation}
                disabled={isSaving || !currentAnnotationKey}
              >
                Save JSON
              </ModalButton>
            </ActionGroup>
          </ModalActions>
        </ModalBody>
      </Modal>
    </HeaderDiv>
  );
};

export default SignIn;
