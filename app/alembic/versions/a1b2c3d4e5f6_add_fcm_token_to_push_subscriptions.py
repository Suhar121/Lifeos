"""add fcm_token to push_subscriptions

Revision ID: a1b2c3d4e5f6
Revises: f8d69c7e8214
Create Date: 2026-02-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'f8d69c7e8214'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add fcm_token column
    op.add_column('push_subscriptions', sa.Column('fcm_token', sa.Text(), nullable=True, unique=True))
    
    # Make legacy columns nullable
    op.alter_column('push_subscriptions', 'endpoint', existing_type=sa.Text(), nullable=True)
    op.alter_column('push_subscriptions', 'p256dh', existing_type=sa.Text(), nullable=True)
    op.alter_column('push_subscriptions', 'auth', existing_type=sa.Text(), nullable=True)


def downgrade() -> None:
    op.drop_column('push_subscriptions', 'fcm_token')
    op.alter_column('push_subscriptions', 'endpoint', existing_type=sa.Text(), nullable=False)
    op.alter_column('push_subscriptions', 'p256dh', existing_type=sa.Text(), nullable=False)
    op.alter_column('push_subscriptions', 'auth', existing_type=sa.Text(), nullable=False)
