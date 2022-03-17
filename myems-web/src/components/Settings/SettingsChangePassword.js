import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, Form } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import FormGroupInput from '../common/FormGroupInput';

const SettingsChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (oldPassword === '' || newPassword === '' || confirmPassword === '') return setIsDisabled(true);

    setIsDisabled(newPassword !== confirmPassword);
  }, [oldPassword, newPassword, confirmPassword]);

  const handleSubmit = e => {
    e.preventDefault();
  };

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Change Password" light={false} />
      <CardBody className="bg-light">
        <Form onSubmit={handleSubmit}>
          <FormGroupInput
            id="old-password"
            label="Old Password"
            value={oldPassword}
            onChange={({ target }) => setOldPassword(target.value)}
            type="password"
          />
          <FormGroupInput
            id="new-password"
            label="New Password"
            value={newPassword}
            onChange={({ target }) => setNewPassword(target.value)}
            type="password"
          />
          <FormGroupInput
            id="confirm-password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            type="password"
          />
          <Button color="primary" block disabled={isDisabled}>
            Update Password
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default SettingsChangePassword;
