import * as React from "react";
import styled from "styled-components";
import sanitizeHtml from "sanitize-html";

import { useWallet } from "context/wallet";
import { postComment } from "services/api";
import Modal from "components/Modal";
import Button from "components/Button";
import Alert from "components/Alert";
import { Form } from "pages/CongressNftPage";

type Props = {
  form: Form;
  showModal: boolean;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
};

const CommentForm = ({ form, showModal, setForm, setShowModal }: Props) => {
  const { address } = useWallet();

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setForm({ ...form, comment: value });
  };

  const handleSaveForm = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      if (form.id && address) {
        const comment = sanitizeHtml(form.comment, { allowedTags: false });
        await postComment({ id: form.id, address, comment });
        setShowModal(false);
      }
    } catch (error) {
      console.log("save form error", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <Modal dismissible open={showModal} handleClose={handleCloseModal}>
      <Wrapper>
        <Alert variant="success">Score saved, add comments for your score decision.</Alert>
        <div>
          <Label htmlFor="reason">Comments? (optional)</Label>
          <textarea id="reason" name="reason" rows={10} cols={50} value={form.comment} onChange={handleCommentChange} />
        </div>
        <div>
          <CancelButton variant="secondary" onClick={handleCloseModal}>
            Cancel
          </CancelButton>
          <Button type="submit" onClick={handleSaveForm}>
            Save comment
          </Button>
        </div>
      </Wrapper>
    </Modal>
  );
};

const Label = styled.label`
  display: block;
  margin-bottom: 0.25em;
`;

const CancelButton = styled(Button)`
  margin-right: 1em;
`;

const Wrapper = styled.form`
  display: grid;
  grid-row-gap: 1em;
`;

export default CommentForm;
