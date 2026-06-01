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
    with op.batch_alter_table('push_subscriptions') as batch_op:
        # Add fcm_token column (unique index added separately below for SQLite compat)
        batch_op.add_column(sa.Column('fcm_token', sa.Text(), nullable=True))
        # Make legacy columns nullable
        batch_op.alter_column('endpoint', existing_type=sa.Text(), nullable=True)
        batch_op.alter_column('p256dh', existing_type=sa.Text(), nullable=True)
        batch_op.alter_column('auth', existing_type=sa.Text(), nullable=True)

    # Create unique index separately (works on all backends including SQLite)
    op.create_index('uq_push_subscriptions_fcm_token', 'push_subscriptions', ['fcm_token'], unique=True)


def downgrade() -> None:
    op.drop_index('uq_push_subscriptions_fcm_token', table_name='push_subscriptions')
    with op.batch_alter_table('push_subscriptions') as batch_op:
        batch_op.drop_column('fcm_token')
        batch_op.alter_column('endpoint', existing_type=sa.Text(), nullable=False)
        batch_op.alter_column('p256dh', existing_type=sa.Text(), nullable=False)
        batch_op.alter_column('auth', existing_type=sa.Text(), nullable=False)
