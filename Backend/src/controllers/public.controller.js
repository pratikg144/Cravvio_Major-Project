const getAbout = (req, res) => {
  const about = {
    title: 'Cravvio',
    subtitle: 'Healthy meals delivered daily',
    description:
      'Cravvio provides fresh, chef-prepared meals tailored to your diet preferences. We deliver across our service area with sustainable packaging and flexible subscriptions.',
    contact: {
      email: 'hello@Cravvio.com',
      phone: '415-201-6370',
      address: '623 Harding Road, Mirpur Cantt, Kanpur'
    },
    team: [
      { name: 'Alice Martin', role: 'CEO' },
      { name: 'Rahul Singh', role: 'CTO' },
      { name: 'Lina Gomez', role: 'Head of Operations' }
    ]
  };

  res.json({ success: true, data: about });
};

module.exports = { getAbout };
