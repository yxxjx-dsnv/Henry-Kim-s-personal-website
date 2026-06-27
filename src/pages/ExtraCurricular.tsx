import { Hero } from '../components/Hero';
import { ActivityItem } from '../components/ActivityItem';
import { activities } from '../data/activities';
import { profile } from '../data/profile';

export function ExtraCurricular() {
  return (
    <section className="section">
      <Hero title="Extra-Curricular" subtitle={`last updated: ${profile.lastUpdated.extraCurricular}`} />
      <section className="extra-curricular-section">
        <div className="text">
          {activities.map((item, i) => (
            <ActivityItem key={i} item={item} />
          ))}
        </div>
      </section>
    </section>
  );
}
