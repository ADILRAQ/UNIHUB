import HealthStatus from '../health/HealthStatus';

const HomePage = () => {
  return (
    <section>
      <h1>Welcome to UniHub</h1>
      <p>Announcements, schedule, resources, recaps, and payments in one place.</p>
      <HealthStatus />
    </section>
  );
};

export default HomePage;
