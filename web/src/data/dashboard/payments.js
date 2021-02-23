export const hours = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM'
];

export const paymentByStatus = {
  all: [4, 1, 6, 2, 7, 12, 4, 6, 5, 4, 5, 10].map(d => (d * 3.14).toFixed(2)),
  successful: [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8].map(d => (d * 3.14).toFixed(2)),
  failed: [1, 0, 2, 1, 2, 1, 1, 0, 0, 1, 0, 2].map(d => (d * 3.14).toFixed(2))
};
