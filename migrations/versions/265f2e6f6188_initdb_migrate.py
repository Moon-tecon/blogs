"""initdb migrate

Revision ID: 265f2e6f6188
Revises: 
Create Date: 2019-01-21 10:07:06.741000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '265f2e6f6188'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('news')
    op.drop_table('product')
    op.drop_table('introduce')
    op.add_column('topic', sa.Column('top', sa.Boolean(), nullable=True))
    op.add_column('topic', sa.Column('top_timestamp', sa.DateTime(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('topic', 'top_timestamp')
    op.drop_column('topic', 'top')
    op.create_table('introduce',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('body', sa.TEXT(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('product',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('intro', sa.VARCHAR(length=255), nullable=True),
    sa.Column('body', sa.TEXT(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('news',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('title', sa.VARCHAR(length=60), nullable=False),
    sa.Column('body', sa.TEXT(), nullable=False),
    sa.Column('timestamp', sa.DATETIME(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###
