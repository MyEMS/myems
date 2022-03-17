import React, { Fragment, useContext } from 'react';
import WizardInput from './WizardInput';
import { Col, Row, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AuthWizardContext } from '../../../context/Context';

const BillingUserForm = ({ register, errors }) => {
  const { handleInputChange } = useContext(AuthWizardContext);

  return (
    <Fragment>
      <Row form>
        <Col>
          <WizardInput
            type="number"
            name="cardNumber"
            label="Card Number*"
            placeholder="•••• •••• •••• ••••"
            className="input-spin-none"
            id="cardNumber"
            innerRef={register({
              required: 'Please Enter your card number'
            })}
            errors={errors}
          />
        </Col>
        <Col>
          <WizardInput
            label="Name on Card*"
            name="nameOnCard"
            placeholder="John Doe"
            id="nameOnCard"
            innerRef={register({
              required: 'Name on card is requred'
            })}
            errors={errors}
          />
        </Col>
      </Row>

      <Row form>
        <Col>
          <WizardInput
            type="select"
            name="country"
            label="Country*"
            onChange={({ target }) => {
              handleInputChange(target);
            }}
            innerRef={register({
              required: 'Country is requred'
            })}
            errors={errors}
            options={[
              'Afghanistan',
              'Albania',
              'Algeria',
              'American Samoa',
              'Andorra',
              'Angola',
              'Anguilla',
              'Antarctica',
              'Antigua and Barbuda',
              'Argentina',
              'Armenia',
              'Aruba',
              'Australia',
              'Austria',
              'Azerbaijan',
              'Bahamas',
              'Bahrain',
              'Bangladesh',
              'Barbados',
              'Belarus',
              'Belgium',
              'Belize',
              'Benin',
              'Bermuda',
              'Bhutan',
              'Bolivia',
              'Bosnia and Herzegowina',
              'Botswana',
              'Bouvet Island',
              'Brazil',
              'British Indian Ocean Territory',
              'Brunei Darussalam',
              'Bulgaria',
              'Burkina Faso',
              'Burundi',
              'Cambodia',
              'Cameroon',
              'Canada',
              'Cape Verde',
              'Cayman Islands',
              'Central African Republic',
              'Chad',
              'Chile',
              'China',
              'Christmas Island',
              'Cocos (Keeling) Islands',
              'Colombia',
              'Comoros',
              'Congo',
              'Congo, the Democratic Republic of the',
              'Cook Islands',
              'Costa Rica',
              "Cote d'Ivoire",
              'Croatia (Hrvatska)',
              'Cuba',
              'Cyprus',
              'Czech Republic',
              'Denmark',
              'Djibouti',
              'Dominica',
              'Dominican Republic',
              'East Timor',
              'Ecuador',
              'Egypt',
              'El Salvador',
              'Equatorial Guinea',
              'Eritrea',
              'Estonia',
              'Ethiopia',
              'Falkland Islands (Malvinas)',
              'Faroe Islands',
              'Fiji',
              'Finland',
              'France',
              'France Metropolitan',
              'French Guiana',
              'French Polynesia',
              'French Southern Territories',
              'Gabon',
              'Gambia',
              'Georgia',
              'Germany',
              'Ghana',
              'Gibraltar',
              'Greece',
              'Greenland',
              'Grenada',
              'Guadeloupe',
              'Guam',
              'Guatemala',
              'Guinea',
              'Guinea-Bissau',
              'Guyana',
              'Haiti',
              'Heard and Mc Donald Islands',
              'Holy See (Vatican City State)',
              'Honduras',
              'Hong Kong',
              'Hungary',
              'Iceland',
              'India',
              'Indonesia',
              'Iran (Islamic Republic of)',
              'Iraq',
              'Ireland',
              'Israel',
              'Italy',
              'Jamaica',
              'Japan',
              'Jordan',
              'Kazakhstan',
              'Kenya',
              'Kiribati',
              "Korea, Democratic People's Republic of",
              'Korea, Republic of',
              'Kuwait',
              'Kyrgyzstan',
              "Lao, People's Democratic Republic",
              'Latvia',
              'Lebanon',
              'Lesotho',
              'Liberia',
              'Libyan Arab Jamahiriya',
              'Liechtenstein',
              'Lithuania',
              'Luxembourg',
              'Macau',
              'Macedonia, The Former Yugoslav Republic of',
              'Madagascar',
              'Malawi',
              'Malaysia',
              'Maldives',
              'Mali',
              'Malta',
              'Marshall Islands',
              'Martinique',
              'Mauritania',
              'Mauritius',
              'Mayotte',
              'Mexico',
              'Micronesia, Federated States of',
              'Moldova, Republic of',
              'Monaco',
              'Mongolia',
              'Montserrat',
              'Morocco',
              'Mozambique',
              'Myanmar',
              'Namibia',
              'Nauru',
              'Nepal',
              'Netherlands',
              'Netherlands Antilles',
              'New Caledonia',
              'New Zealand',
              'Nicaragua',
              'Niger',
              'Nigeria',
              'Niue',
              'Norfolk Island',
              'Northern Mariana Islands',
              'Norway',
              'Oman',
              'Pakistan',
              'Palau',
              'Panama',
              'Papua New Guinea',
              'Paraguay',
              'Peru',
              'Philippines',
              'Pitcairn',
              'Poland',
              'Portugal',
              'Puerto Rico',
              'Qatar',
              'Reunion',
              'Romania',
              'Russian Federation',
              'Rwanda',
              'Saint Kitts and Nevis',
              'Saint Lucia',
              'Saint Vincent and the Grenadines',
              'Samoa',
              'San Marino',
              'Sao Tome and Principe',
              'Saudi Arabia',
              'Senegal',
              'Seychelles',
              'Sierra Leone',
              'Singapore',
              'Slovakia (Slovak Republic)',
              'Slovenia',
              'Solomon Islands',
              'Somalia',
              'South Africa',
              'South Georgia and the South Sandwich Islands',
              'Spain',
              'Sri Lanka',
              'St. Helena',
              'St. Pierre and Miquelon',
              'Sudan',
              'Suriname',
              'Svalbard and Jan Mayen Islands',
              'Swaziland',
              'Sweden',
              'Switzerland',
              'Syrian Arab Republic',
              'Taiwan, Province of China',
              'Tajikistan',
              'Tanzania, United Republic of',
              'Thailand',
              'Togo',
              'Tokelau',
              'Tonga',
              'Trinidad and Tobago',
              'Tunisia',
              'Turkey',
              'Turkmenistan',
              'Turks and Caicos Islands',
              'Tuvalu',
              'Uganda',
              'Ukraine',
              'United Arab Emirates',
              'United Kingdom',
              'United States',
              'United States Minor Outlying Islands',
              'Uruguay',
              'Uzbekistan',
              'Vanuatu',
              'Venezuela',
              'Vietnam',
              'Virgin Islands (British)',
              'Virgin Islands (U.S.)',
              'Wallis and Futuna Islands',
              'Western Sahara',
              'Yemen',
              'Yugoslavia',
              'Zambia',
              'Zimbabwe'
            ]}
            placeholder="Select your country"
            id="country"
          />
        </Col>
        <Col>
          <WizardInput
            type="number"
            name="zipCode"
            label="Zip Code*"
            className="input-spin-none"
            placeholder="1234"
            id="zipcode"
            onChange={({ target }) => {
              handleInputChange(target);
            }}
            innerRef={register({
              required: 'Zip Code is requred'
            })}
            errors={errors}
          />
        </Col>
      </Row>
      <Row form>
        <Col>
          <WizardInput
            label="Date of Birth"
            id="date"
            customType="datetime"
            name="expdate"
            placeholder="DD/YYYY"
            dateFormat="MM-YYYY"
            errors={errors}
          />
        </Col>
        <Col>
          <WizardInput
            label={
              <Fragment>
                CVV*
                <span className="d-inline-block cursor-pointer text-secondary" id="CVVTooltip">
                  <FontAwesomeIcon icon="question-circle" className="mx-2" />
                </span>
                <UncontrolledTooltip placement="top" target="CVVTooltip">
                  Card verification value
                </UncontrolledTooltip>
              </Fragment>
            }
            name="cvv"
            placeholder="123"
            id="ccv"
            onChange={({ target }) => {
              handleInputChange(target);
            }}
            className="input-spin-none"
            innerRef={register({
              required: 'CVV is requred',
              maxLength: {
                value: 3,
                message: 'cvv must have at max 3 characters'
              }
            })}
            errors={errors}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default BillingUserForm;
