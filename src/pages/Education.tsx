import { Hero } from '../components/Hero';
import { ActivityItem } from '../components/ActivityItem';
import { education } from '../data/education';
import { profile } from '../data/profile';

export function Education() {
  return (
    <section className="section">
      <Hero title="Education" subtitle={`last updated: ${profile.lastUpdated.education}`} />
      <section className="extra-curricular-section">
        <div className="text">
          {education.map((item, i) => (
            <ActivityItem key={i} item={item} />
          ))}
        </div>
      </section>
    </section>
  );
}
