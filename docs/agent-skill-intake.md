# Agent Skill Intake

Use this when adding a new design skill, design repo, animation pack, or visual reference.

## Intake Fields

- Name
- Source URL
- License
- What it helps us do
- When an agent should invoke it
- What not to use it for
- Dependencies
- Verification method
- Owner
- Status: `candidate`, `approved`, `installed`, `retired`

## Acceptance Bar

A skill or design resource can be added when:

1. The license is acceptable.
2. It has a clear trigger.
3. It does not duplicate an existing skill without improving it.
4. It includes a practical verification step.
5. It has one owner.

## Install Rule

Do not silently add a skill to every agent. Add it to the repo first, document the trigger, test it on one real task, then promote it.

## Caddy Rule

Once approved, Caddy or the agent router should know when to invoke it. The user should not need to remember the skill name.
