import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('genres')
export class GenresEntity {
  @PrimaryColumn()
  slug: string;

  @Column()
  label: string;

  @Column({ name: 'story_prompt', type: 'text' })
  storyPrompt: string;
}
